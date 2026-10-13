// Produto único. Valores conferidos no servidor; o cliente só exibe.
export const PRODUCT = {
  id: "clube-cupons-30d",
  name: "Clube de Cupons — 30 dias",
  amountCents: 1990,
  currency: "BRL",
  accessDays: 30,
} as const;

export const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const orderExternalId = (orderId: string) => `order-${orderId}`;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function orderIdFromExternalId(externalId: string): string | null {
  const m = /^order-(.+)$/.exec(externalId);
  return m && UUID.test(m[1]) ? m[1].toLowerCase() : null;
}

/** expires_at = starts_at + 30 dias corridos (espelha a regra SQL). */
export function membershipWindow(confirmedAt: Date) {
  return {
    startsAt: confirmedAt,
    expiresAt: new Date(confirmedAt.getTime() + PRODUCT.accessDays * 24 * 60 * 60 * 1000),
  };
}

export const amountToCents = (amount: number) => Math.round(amount * 100);
