-- SURTIMAX Supabase clean schema
-- Ejecuta este archivo en Supabase SQL Editor para dejar la base limpia:
-- admin inicial + catálogo de productos; cotizaciones, notificaciones y clientes empiezan en cero.

create extension if not exists pgcrypto;

drop table if exists public.password_reset_requests cascade;
drop table if exists public.notifications cascade;
drop table if exists public.quotation_items cascade;
drop table if exists public.quotations cascade;
drop table if exists public.products cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  cedula text not null default '',
  address text not null default '',
  phone text not null default '',
  email text not null unique,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.products (
  id text primary key,
  code text not null unique,
  name text not null,
  category text not null,
  price numeric(12,2) not null default 0,
  presentation text not null default '',
  units_per_pack integer not null default 0,
  stock integer not null default 0,
  available boolean not null default true,
  image_url text,
  created_at timestamptz not null default now()
);

create table public.quotations (
  id text primary key,
  number text not null unique,
  date date not null default current_date,
  client_id text not null,
  client_name text not null,
  client_cedula text not null,
  client_address text not null,
  client_phone text not null,
  client_email text,
  total_cotizado numeric(12,2) not null default 0,
  subtotal numeric(12,2) not null default 0,
  iva numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  final_total numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'delivered')),
  created_at timestamptz not null default now()
);

create table public.quotation_items (
  id text primary key default gen_random_uuid()::text,
  quotation_id text not null references public.quotations(id) on delete cascade,
  code text not null,
  description text not null,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null default 0
);

create table public.notifications (
  id text primary key,
  type text not null,
  message text not null,
  date date not null default current_date,
  read boolean not null default false,
  quotation_id text references public.quotations(id) on delete cascade,
  created_at timestamptz not null default now()
);


insert into public.profiles (id, name, cedula, address, phone, email, is_admin)
values ('admin', 'Administrador SURTIMAX', '2200123456001', 'Quito, Ecuador', '0989961041', 'admin@surtimax.com', true);

insert into public.products (id, code, name, category, price, presentation, units_per_pack, stock, available, image_url)
values
  ('p1', 'CAR-001', 'MENTA GLACIAL', 'Caramelos', 3.50, 'Paca x 100u', 100, 50, true, null),
  ('p2', 'CAR-002', 'KAUMAL MANZANILLA Y MIEL', 'Caramelos', 3.80, 'Paca x 100u', 100, 45, true, null),
  ('p3', 'CAR-003', 'KAUMAL ORIGINAL', 'Caramelos', 3.80, 'Paca x 100u', 100, 60, true, null),
  ('p4', 'CAR-004', 'KAUMAL JENGIBRE', 'Caramelos', 3.80, 'Paca x 100u', 100, 40, true, null),
  ('p5', 'CAR-005', 'LECHE Y MIEL', 'Caramelos', 4.20, 'Paca x 100u', 100, 35, true, null),
  ('p6', 'CAR-006', 'BARRILETE', 'Caramelos', 2.50, 'Paca x 100u', 100, 80, true, null),
  ('p7', 'CAR-007', 'MANGO BICHE', 'Caramelos', 3.20, 'Paca x 100u', 100, 55, true, null),
  ('p8', 'CAR-008', 'BOLA DE FUEGO', 'Caramelos', 3.50, 'Paca x 100u', 100, 70, true, null),
  ('p9', 'CAR-009', 'CHUPETIN GRANDE', 'Caramelos', 5.00, 'Bolsa x 50u', 50, 30, true, null),
  ('p10', 'CAR-010', 'CARAMELOS SURTIDOS', 'Caramelos', 5.20, 'Paca x 200u', 200, 45, true, null),
  ('p11', 'CON-001', 'KOLITA LOKA', 'Confites', 5.50, 'Paca x 50u', 50, 40, true, null),
  ('p12', 'CON-002', 'MARSHMALLOWS', 'Confites', 4.80, 'Bolsa x 250g', 1, 25, true, null),
  ('p13', 'PAL-001', 'PALETA CHAMOYADA', 'Confites', 6.00, 'Caja x 24u', 24, 20, true, null),
  ('p14', 'GEL-001', 'GELATINAS PEQUEÑA', 'Gelatinas', 8.00, 'Caja x 24u', 24, 20, true, null),
  ('p15', 'GEL-002', 'GELATINAS GRANDE', 'Gelatinas', 15.00, 'Caja x 12u', 12, 15, true, null),
  ('p16', 'CHO-001', 'MANICHO BOMBÓN', 'Chocolates', 12.00, 'Caja x 24u', 24, 18, true, null),
  ('p17', 'CHO-002', 'CHOCOLATINAS', 'Chocolates', 18.00, 'Caja x 48u', 48, 22, true, null),
  ('p18', 'CHO-003', 'TRUFFLES SURTIDOS', 'Chocolates', 25.00, 'Caja x 12u', 12, 8, true, null),
  ('p19', 'CHI-001', 'CHICLE TUTTI FRUTI', 'Chicles', 4.50, 'Bolsa x 100u', 100, 65, true, null),
  ('p20', 'CHI-002', 'CHICLE MENTA', 'Chicles', 4.50, 'Bolsa x 100u', 100, 60, true, null),
  ('p21', 'GOM-001', 'GOMITAS OSITOS', 'Gomas', 7.50, 'Bolsa x 500g', 1, 28, true, null),
  ('p22', 'GOM-002', 'GOMITAS GUSANOS', 'Gomas', 7.50, 'Bolsa x 500g', 1, 32, true, null),
  ('p23', 'GAL-001', 'GALLETAS RELLENAS', 'Otros', 22.00, 'Caja x 12u', 12, 10, true, null),
  ('p24', 'WAF-001', 'WAFER CHOCOLATE', 'Otros', 15.00, 'Caja x 24u', 24, 16, true, null);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Productos lectura" on public.products;
drop policy if exists "Productos escritura" on public.products;
drop policy if exists "Perfiles lectura" on public.profiles;
drop policy if exists "Perfiles escritura" on public.profiles;
drop policy if exists "Cotizaciones lectura" on public.quotations;
drop policy if exists "Cotizaciones escritura" on public.quotations;
drop policy if exists "Items lectura" on public.quotation_items;
drop policy if exists "Items escritura" on public.quotation_items;
drop policy if exists "Notificaciones lectura" on public.notifications;
drop policy if exists "Notificaciones escritura" on public.notifications;
drop policy if exists "Productos visibles" on public.products;
drop policy if exists "Perfiles visibles por anon para demo" on public.profiles;

create policy "Productos lectura" on public.products for select using (true);
create policy "Productos escritura" on public.products for all using (true) with check (true);
create policy "Perfiles lectura" on public.profiles for select using (true);
create policy "Perfiles escritura" on public.profiles for all using (true) with check (true);
create policy "Cotizaciones lectura" on public.quotations for select using (true);
create policy "Cotizaciones escritura" on public.quotations for all using (true) with check (true);
create policy "Items lectura" on public.quotation_items for select using (true);
create policy "Items escritura" on public.quotation_items for all using (true) with check (true);
create policy "Notificaciones lectura" on public.notifications for select using (true);
create policy "Notificaciones escritura" on public.notifications for all using (true) with check (true);

alter table public.notifications replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'notifications'
    ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
