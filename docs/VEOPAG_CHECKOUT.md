# Checkout VeoPag — implantação controlada

**Estado:** integração de código preparada, **não validada em produção**. Nunca defina `CHECKOUT_ENABLED=true` antes dos testes e de aplicar a migração SQL.

## Secrets no runtime do backend (não no navegador)

- `VEOPAG_CLIENT_ID` e `VEOPAG_CLIENT_SECRET`: credenciais da API
- `VEOPAG_WEBHOOK_SIGNATURE`: chave HMAC configurada no painel VeoPag
- `VEOPAG_CALLBACK_TOKEN`: token do cabeçalho Authorization, se fornecido pela VeoPag
- `APP_BASE_URL`: URL HTTPS pública do backend
- `DATABASE_URL`: conexão Postgres privada com permissão nas tabelas criadas pela migração
- `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`: validação da sessão do comprador
- `CHECKOUT_ENABLED=false` até validação completa

Os secrets configurados na Lovable só estarão disponíveis se forem propagados ao **runtime servidor**. A existência no painel não confirma isso.

## Migração e webhook

Execute `sql/20261013_coupon_checkout.sql` no banco Postgres com esquema `auth.users`. O código espera esse esquema. A rota prevista é `POST {APP_BASE_URL}/api/veopag-webhook`; configure a mesma URL no painel VeoPag em Deposit webhook URL, com Webhook Signature correspondente. Teste alcance público HTTPS, assinatura correta, resposta 2xx e reenvio.

## Teste controlado

1. Mantenha checkout desabilitado até confirmar migração, secrets, URL pública, permissões e build.
2. Execute `npm test`, `npm run build` e `npm run lint` no ambiente de build.
3. Configure `CHECKOUT_ENABLED=true` **somente em um ambiente privado de homologação** com controle de acesso.
4. Crie uma conta de teste, gere um PIX de R$ 19,90 e confirme que pedidos pendentes não liberam membros.
5. Pague com uma conta real autorizada e confirme o status consultado na VeoPag, a assinatura do webhook, a transição idempotente para COMPLETED e a expiração em 30 dias.
6. Simule duplicações de callback e cliques, falhas de rede, pedidos de outros usuários e replay de assinatura.
7. Recoloque `CHECKOUT_ENABLED=false` se qualquer validação falhar.

**Não há evidência de que o endpoint esteja público, que as variáveis estejam presentes ou que uma cobrança tenha sido criada.**
