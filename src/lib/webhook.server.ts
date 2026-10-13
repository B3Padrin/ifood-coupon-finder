import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { PRODUCT, amountToCents, orderIdFromExternalId } from "./product";
import type { DepositSnapshot } from "./veopag.server";

export const REPLAY_WINDOW_SEC = 300;

function safeEq(a: string, b: string) {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  return x.length === y.length && timingSafeEqual(x, y);
}

export function verifySignature(opts: {
  rawBody: string;
  timestamp: string | null;
  signature: string | null;
  secret: string;
  nowSec: number;
}): "ok" | "missing" | "replay" | "invalid" {
  const { rawBody, timestamp, signature, secret, nowSec } = opts;
  if (!timestamp || !signature) return "missing";
  if (!/^\d{1,12}$/.test(timestamp) || Math.abs(nowSec - Number(timestamp)) > REPLAY_WINDOW_SEC) return "replay";
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return safeEq(expected, signature.toLowerCase()) ? "ok" : "invalid";
}

export function verifyCallbackToken(header: string | null, token: string) {
  const m = /^Bearer (\S+)$/.exec(header ?? "");
  return !!m?.[1] && safeEq(m[1], token);
}

export const depositEventSchema = z
  .object({
    type: z.string(),
    external_id: z.string().max(100),
    transaction_id: z.string().min(1).max(100),
    status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]),
    currency: z.string().optional(),
    amount: z.number(),
    payment_method: z.string().optional(),
  })
  .passthrough();

export type WebhookDeps = {
  secret: string;
  callbackToken?: string;
  nowSec: number;
  /** grava evento; retorna false se (transaction_id,status) já foi processado */
  recordEvent: (txId: string, status: string, payload: unknown) => Promise<"new" | "processed">;
  markProcessed: (txId: string, status: string, outcome: string) => Promise<void>;
  findOrder: (orderId: string) => Promise<{ id: string; amount_cents: number; status: string } | null>;
  confirm: (orderId: string, txId: string, amountCents: number) => Promise<string>;
  fail: (orderId: string) => Promise<string>;
  queryGateway: (txId: string) => Promise<DepositSnapshot | null>;
};

export type WebhookResult = { status: number; body: string };

/** Remove dados pessoais antes de persistir. */
export function sanitizePayload(p: Record<string, unknown>) {
  const { payer_cpf: _c, payer_name: _n, payer_ispb: _i, ...rest } = p;
  return rest;
}

export async function handleVeopagWebhook(
  req: { rawBody: string; headers: { get(n: string): string | null } },
  deps: WebhookDeps,
): Promise<WebhookResult> {
  if (deps.callbackToken && !verifyCallbackToken(req.headers.get("authorization"), deps.callbackToken)) {
    return { status: 401, body: "unauthorized" };
  }
  const sig = verifySignature({
    rawBody: req.rawBody,
    timestamp: req.headers.get("x-webhook-timestamp"),
    signature: req.headers.get("x-webhook-signature"),
    secret: deps.secret,
    nowSec: deps.nowSec,
  });
  if (sig !== "ok") return { status: 401, body: `signature_${sig}` };

  let json: unknown;
  try {
    json = JSON.parse(req.rawBody);
  } catch {
    return { status: 400, body: "invalid_json" };
  }
  const parsed = depositEventSchema.safeParse(json);
  if (!parsed.success) return { status: 400, body: "invalid_payload" };
  const ev = parsed.data;
  if (ev.type !== "Deposit") return { status: 200, body: "ignored_type" };

  const state = await deps.recordEvent(ev.transaction_id, ev.status, sanitizePayload(ev));
  if (state === "processed") return { status: 200, body: "duplicate" };
  const done = async (outcome: string, status = 200) => {
    await deps.markProcessed(ev.transaction_id, ev.status, outcome);
    return { status, body: outcome };
  };

  const orderId = orderIdFromExternalId(ev.external_id);
  const order = orderId ? await deps.findOrder(orderId) : null;
  if (!order) return done("order_not_found");

  if (ev.status === "FAILED") return done(`fail_${await deps.fail(order.id)}`);
  if (ev.status !== "COMPLETED") return done("not_final");

  if (ev.currency !== "BRL" || (ev.payment_method ?? "").toLowerCase() !== "pix") return done("invalid_method");
  if (amountToCents(ev.amount) !== PRODUCT.amountCents || order.amount_cents !== PRODUCT.amountCents) {
    return done("amount_mismatch");
  }

  // Confirmação autenticada no gateway antes de liberar acesso.
  const snap = await deps.queryGateway(ev.transaction_id);
  if (
    !snap ||
    snap.status !== "COMPLETED" ||
    snap.externalId !== ev.external_id ||
    snap.transactionId !== ev.transaction_id ||
    amountToCents(snap.amount) !== PRODUCT.amountCents
  ) {
    return done("gateway_unconfirmed");
  }
  return done(`confirm_${await deps.confirm(order.id, ev.transaction_id, PRODUCT.amountCents)}`);
}
