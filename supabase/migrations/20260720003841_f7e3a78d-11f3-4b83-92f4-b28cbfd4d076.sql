
-- ============ ENUMS & ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- First user to sign up becomes admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ SERVICES ============
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active services" ON public.services FOR SELECT TO anon, authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ PROFESSIONALS ============
CREATE TABLE public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.professionals TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.professionals TO authenticated;
GRANT ALL ON public.professionals TO service_role;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active pros" ON public.professionals FOR SELECT TO anon, authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage pros" ON public.professionals FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ WORKING HOURS ============ (weekday 0=Sun..6=Sat)
CREATE TABLE public.working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  UNIQUE (professional_id, weekday)
);
GRANT SELECT ON public.working_hours TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.working_hours TO authenticated;
GRANT ALL ON public.working_hours TO service_role;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read working hours" ON public.working_hours FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage working hours" ON public.working_hours FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ TIME BLOCKS (holidays / off hours) ============
CREATE TABLE public.time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE, -- NULL = salon-wide
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
GRANT SELECT ON public.time_blocks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.time_blocks TO authenticated;
GRANT ALL ON public.time_blocks TO service_role;
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read blocks" ON public.time_blocks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage blocks" ON public.time_blocks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ BOOKINGS ============
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id),
  professional_id UUID NOT NULL REFERENCES public.professionals(id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  notes TEXT,
  external_ref TEXT, -- future sync target reference
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
-- Public can INSERT their own booking (validation done in server fn)
CREATE POLICY "anyone can create booking" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');
-- Only admins can read/update/delete bookings
CREATE POLICY "admins read bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete bookings" ON public.bookings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Prevent double bookings at the DB level (exclusion on time range, ignoring cancelled)
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE public.bookings ADD CONSTRAINT no_overlap_per_pro
  EXCLUDE USING gist (
    professional_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status <> 'cancelled');

CREATE INDEX bookings_pro_start_idx ON public.bookings (professional_id, starts_at);
CREATE INDEX bookings_status_idx ON public.bookings (status);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER bookings_touch BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- ============ SEED DATA (fictional demo data) ============
INSERT INTO public.services (slug, name, description, duration_minutes, sort_order) VALUES
  ('balayage', 'Balayage', 'Hand-painted highlights for a sun-kissed, lived-in blend.', 180, 1),
  ('blonde-hair', 'Blonde Hair', 'Luminous blondes with focus on tone and condition.', 150, 2),
  ('brunette-hair', 'Brunette Hair', 'Dimensional brunettes with editorial richness.', 120, 3),
  ('hair-colour', 'Hair Colour', 'Bespoke single-process colour, tailored to skin tone.', 90, 4),
  ('hair-treatment', 'Hair Treatment', 'Reparative in-salon care rituals.', 60, 5),
  ('womens-haircut', 'Women''s Haircut', 'Considered cut shaped to your hair and lifestyle.', 60, 6),
  ('styling', 'Styling', 'Blowouts, waves and event finishes.', 45, 7),
  ('wedding-hair', 'Wedding Hair', 'Bridal styling — trials and day-of.', 120, 8),
  ('nails', 'Nails', 'Manicure and considered nail care.', 60, 9);

INSERT INTO public.professionals (name, bio, sort_order) VALUES
  -- Demo data only: fictional professionals.
  ('Demo Stylist A', 'Demo profile — colour specialist.', 1),
  ('Demo Stylist B', 'Demo profile — cuts & styling.', 2),
  ('Demo Stylist C', 'Demo profile — bridal styling.', 3);

-- Default working hours: Tue-Sat 10:00-19:00 for every pro
INSERT INTO public.working_hours (professional_id, weekday, open_time, close_time)
SELECT p.id, w.weekday, '10:00'::time, '19:00'::time
FROM public.professionals p
CROSS JOIN (VALUES (2),(3),(4),(5),(6)) AS w(weekday);
