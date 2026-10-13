-- Executar no banco Postgres do backend antes de habilitar o checkout.
CREATE TABLE IF NOT EXISTS public.coupon_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id),
 external_id text NOT NULL UNIQUE,
 amount_cents integer NOT NULL DEFAULT 1990 CHECK (amount_cents=1990),
 currency text NOT NULL DEFAULT 'BRL' CHECK (currency='BRL'),
 status text NOT NULL DEFAULT 'PENDING',
 transaction_id text UNIQUE,
 pix_code text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS coupon_orders_one_pending_per_user ON public.coupon_orders(user_id) WHERE status='PENDING';
CREATE TABLE IF NOT EXISTS public.coupon_memberships (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id),
 order_id uuid NOT NULL UNIQUE REFERENCES public.coupon_orders(id),
 starts_at timestamptz NOT NULL,
 expires_at timestamptz NOT NULL,
 status text NOT NULL DEFAULT 'ACTIVE'
);
ALTER TABLE public.coupon_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_memberships ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.coupon_orders FROM anon, authenticated;
REVOKE ALL ON public.coupon_memberships FROM anon, authenticated;
-- O servidor acessa as tabelas via conexão Postgres privada; nunca expor DATABASE_URL ao browser.

CREATE TABLE IF NOT EXISTS public.coupon_webhook_events (
 transaction_id text NOT NULL,
 status text NOT NULL,
 payload jsonb NOT NULL,
 outcome text,
 processed_at timestamptz,
 received_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(transaction_id,status)
);
ALTER TABLE public.coupon_webhook_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.coupon_webhook_events FROM anon, authenticated;
