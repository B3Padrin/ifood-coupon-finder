-- Clube de Cupons: pedidos PIX, assinaturas de 30 dias, cupons e webhooks
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text CHECK (char_length(name) <= 120),
  email text NOT NULL CHECK (char_length(email) <= 254),
  phone text CHECK (phone ~ '^[0-9]{10,11}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id text NOT NULL,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  currency text NOT NULL DEFAULT 'BRL' CHECK (currency = 'BRL'),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAID','FAILED')),
  external_id text NOT NULL UNIQUE,
  gateway_transaction_id text UNIQUE,
  pix_qrcode text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  CHECK ((status = 'PAID') = (paid_at IS NOT NULL))
);
-- Idempotência: no máximo um pedido pendente por usuário/produto
CREATE UNIQUE INDEX orders_one_pending_per_user ON public.orders (user_id, product_id) WHERE status = 'PENDING';
CREATE INDEX orders_user_idx ON public.orders (user_id, created_at DESC);
CREATE INDEX orders_pending_idx ON public.orders (created_at) WHERE status = 'PENDING';
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE RESTRICT,
  starts_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','REVOKED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > starts_at)
);
CREATE INDEX memberships_user_idx ON public.memberships (user_id, expires_at DESC);
GRANT SELECT ON public.memberships TO authenticated;
GRANT ALL ON public.memberships TO service_role;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memberships_select_own" ON public.memberships FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL,
  event_status text NOT NULL,
  payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  outcome text,
  UNIQUE (transaction_id, event_status)
);
GRANT ALL ON public.webhook_events TO service_role;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  code text,
  discount_type text NOT NULL CHECK (discount_type IN ('PERCENT','FIXED','FREE_DELIVERY')),
  discount_value numeric(10,2) NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
  terms text NOT NULL DEFAULT '',
  valid_until timestamptz,
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX coupons_active_idx ON public.coupons (active, valid_until);
GRANT SELECT ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rate_limits (
  key text NOT NULL,
  window_start timestamptz NOT NULL,
  hits integer NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);
GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_active_membership(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = _user_id AND status = 'ACTIVE' AND starts_at <= now() AND expires_at > now()
  );
$$;
REVOKE ALL ON FUNCTION public.has_active_membership(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_membership(uuid) TO authenticated, service_role;

CREATE POLICY "coupons_members_only" ON public.coupons FOR SELECT TO authenticated
  USING (active AND (valid_until IS NULL OR valid_until > now()) AND public.has_active_membership(auth.uid()));

-- Rate limit com janela fixa, atômico
CREATE OR REPLACE FUNCTION public.rate_limit_hit(_key text, _max integer, _window_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE w timestamptz := to_timestamp(floor(extract(epoch FROM now()) / _window_seconds) * _window_seconds);
DECLARE n integer;
BEGIN
  INSERT INTO public.rate_limits (key, window_start, hits) VALUES (_key, w, 1)
  ON CONFLICT (key, window_start) DO UPDATE SET hits = public.rate_limits.hits + 1
  RETURNING hits INTO n;
  DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 day';
  RETURN n <= _max;
END $$;
REVOKE ALL ON FUNCTION public.rate_limit_hit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rate_limit_hit(text, integer, integer) TO service_role;

-- Confirmação atômica: trava o pedido, valida valor, cria acesso de 30 dias uma única vez
CREATE OR REPLACE FUNCTION public.confirm_order_payment(_order_id uuid, _transaction_id text, _amount_cents integer)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.orders%ROWTYPE;
DECLARE confirmed_at timestamptz := now();
BEGIN
  SELECT * INTO o FROM public.orders WHERE id = _order_id FOR UPDATE;
  IF NOT FOUND THEN RETURN 'ORDER_NOT_FOUND'; END IF;
  IF o.status = 'PAID' THEN RETURN 'ALREADY_PAID'; END IF;
  IF o.amount_cents <> _amount_cents THEN RETURN 'AMOUNT_MISMATCH'; END IF;
  IF o.gateway_transaction_id IS NOT NULL AND o.gateway_transaction_id <> _transaction_id THEN RETURN 'TRANSACTION_MISMATCH'; END IF;
  UPDATE public.orders SET status = 'PAID', paid_at = confirmed_at, updated_at = confirmed_at,
    gateway_transaction_id = _transaction_id WHERE id = _order_id;
  INSERT INTO public.memberships (user_id, order_id, starts_at, expires_at)
  VALUES (o.user_id, o.id, confirmed_at, confirmed_at + interval '30 days')
  ON CONFLICT (order_id) DO NOTHING;
  RETURN 'CONFIRMED';
END $$;
REVOKE ALL ON FUNCTION public.confirm_order_payment(uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_order_payment(uuid, text, integer) TO service_role;

-- Falha só se ainda pendente (nunca regride PAID)
CREATE OR REPLACE FUNCTION public.fail_order(_order_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.orders SET status = 'FAILED', updated_at = now() WHERE id = _order_id AND status = 'PENDING';
  RETURN CASE WHEN FOUND THEN 'FAILED' ELSE 'NOOP' END;
END $$;
REVOKE ALL ON FUNCTION public.fail_order(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fail_order(uuid) TO service_role;

-- Trava contra regressão de status
CREATE OR REPLACE FUNCTION public.orders_guard_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF OLD.status = 'PAID' AND NEW.status <> 'PAID' THEN
    RAISE EXCEPTION 'Pedido pago não pode regredir de status';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER orders_guard_status BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.orders_guard_status();