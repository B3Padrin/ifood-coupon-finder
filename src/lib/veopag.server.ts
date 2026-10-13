import { z } from "zod";

const BASE = "https://api.veopag.com";
const TOKEN_TTL_MS = 55 * 60 * 1000;
const TIMEOUT_MS = 10_000;

type Fetch = typeof fetch;
export type VeopagCreds = { clientId: string; clientSecret: string };

export class VeopagError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

let cached: { token: string; until: number; key: string } | null = null;
export const _resetTokenCache = () => {
  cached = null;
};

async function timedFetch(f: Fetch, url: string, init: RequestInit) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await f(url, { ...init, signal: ctrl.signal });
  } catch (e) {
    throw new VeopagError(ctrl.signal.aborted ? "Tempo esgotado no gateway" : "Falha de rede no gateway");
  } finally {
    clearTimeout(t);
  }
}

export async function getToken(creds: VeopagCreds, f: Fetch = fetch, force = false, now = Date.now()) {
  if (!force && cached && cached.key === creds.clientId && now < cached.until) return cached.token;
  const res = await timedFetch(f, `${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ client_id: creds.clientId, client_secret: creds.clientSecret }),
  });
  if (res.status !== 200) throw new VeopagError("Falha na autenticação do gateway", res.status);
  const data = z.object({ token: z.string().min(10) }).parse(await res.json());
  cached = { token: data.token, until: now + TOKEN_TTL_MS, key: creds.clientId };
  return data.token;
}

async function authed(creds: VeopagCreds, f: Fetch, path: string, init: RequestInit) {
  const call = async (force: boolean) => {
    const token = await getToken(creds, f, force);
    return timedFetch(f, `${BASE}${path}`, {
      ...init,
      headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
  };
  let res = await call(false);
  if (res.status === 401) res = await call(true); // token revogado: renova uma vez
  return res;
}

export type DepositInput = {
  amount: number;
  externalId: string;
  callbackUrl: string;
  payer: { name: string; email: string; document: string; phone?: string };
};
export type DepositResult = { transactionId: string; status: string; qrcode: string; idempotent: boolean };

const created201 = z.object({
  qrCodeResponse: z.object({
    transactionId: z.string().min(1),
    status: z.string(),
    qrcode: z.string().min(20),
    amount: z.number(),
  }),
});
const replay200 = z.object({
  transaction_id: z.string().min(1),
  external_id: z.string(),
  status: z.string(),
  qrcode: z.string().min(20),
  idempotent: z.literal(true),
});

export async function createDeposit(creds: VeopagCreds, input: DepositInput, f: Fetch = fetch): Promise<DepositResult> {
  const res = await authed(creds, f, "/api/payments/deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: input.amount,
      external_id: input.externalId,
      clientCallbackUrl: input.callbackUrl,
      payer: {
        name: input.payer.name,
        email: input.payer.email,
        document: input.payer.document,
        ...(input.payer.phone ? { phone: input.payer.phone } : {}),
      },
    }),
  });
  if (res.status === 201) {
    const d = created201.parse(await res.json()).qrCodeResponse;
    return { transactionId: d.transactionId, status: d.status, qrcode: d.qrcode, idempotent: false };
  }
  if (res.status === 200) {
    const d = replay200.parse(await res.json());
    if (d.external_id !== input.externalId) throw new VeopagError("external_id divergente na resposta");
    return { transactionId: d.transaction_id, status: d.status, qrcode: d.qrcode, idempotent: true };
  }
  throw new VeopagError("Gateway recusou a cobrança", res.status);
}

const depositQuery = z.object({
  deposit: z
    .object({
      transaction_id: z.string(),
      external_id: z.string(),
      amount: z.number(),
      status: z.string(),
    })
    .passthrough()
    .nullable(),
});
export type DepositSnapshot = { transactionId: string; externalId: string; amount: number; status: string };

export async function getDeposit(
  creds: VeopagCreds,
  by: { external_id: string } | { transaction_id: string },
  f: Fetch = fetch,
): Promise<DepositSnapshot | null> {
  const qs = new URLSearchParams(by as Record<string, string>).toString();
  const res = await authed(creds, f, `/api/transactions/deposit?${qs}`, { method: "GET" });
  if (res.status !== 200) throw new VeopagError("Falha ao consultar depósito", res.status);
  const d = depositQuery.parse(await res.json()).deposit;
  return d ? { transactionId: d.transaction_id, externalId: d.external_id, amount: d.amount, status: d.status } : null;
}
