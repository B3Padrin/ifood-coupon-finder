// Configuração lida apenas no servidor, sempre dentro de handlers.
export type ServerConfig = {
  checkoutEnabled: boolean;
  veopagClientId?: string;
  veopagClientSecret?: string;
  webhookSignature?: string;
  callbackToken?: string;
  appBaseUrl?: string;
  missing: string[];
};

export function getServerConfig(env: Record<string, string | undefined> = process.env): ServerConfig {
  const cfg = {
    veopagClientId: env["VEOPAG_CLIENT_ID"],
    veopagClientSecret: env["VEOPAG_CLIENT_SECRET"],
    webhookSignature: env["VEOPAG_WEBHOOK_SIGNATURE"],
    callbackToken: env["VEOPAG_CALLBACK_TOKEN"],
    appBaseUrl: env["APP_BASE_URL"],
  };
  const missing: string[] = [];
  if (!cfg.veopagClientId) missing.push("VEOPAG_CLIENT_ID");
  if (!cfg.veopagClientSecret) missing.push("VEOPAG_CLIENT_SECRET");
  if (!cfg.webhookSignature) missing.push("VEOPAG_WEBHOOK_SIGNATURE");
  if (!cfg.appBaseUrl || !cfg.appBaseUrl.startsWith("https://")) missing.push("APP_BASE_URL(https)");
  // Vendas reais exigem flag explícita E toda a configuração presente.
  const flag = env["CHECKOUT_ENABLED"] === "true";
  return { ...cfg, missing, checkoutEnabled: flag && missing.length === 0 };
}
