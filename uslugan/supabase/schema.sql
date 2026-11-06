-- ============ РОЛИ ============
create type public.user_role as enum ('guest','client','provider','moderator','admin');
create type public.provider_status as enum ('pending','active','blocked');

-- ============ ПРОФИЛИ ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  telegram_id bigint unique,
  username text,
  full_name text,
  avatar_url text,
  phone text,
  role public.user_role not null default 'client',
  created_at timestamptz default now()
);

-- ============ КАТЕГОРИИ ============
create table public.categories (
  id serial primary key,
  slug text unique not null,
  name text not null
);

-- ============ ИСПОЛНИТЕЛИ ============
create table public.providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  description text,
  category_id int references public.categories(id),
  city text,
  price_from numeric,
  phone text,
  avatar_url text,
  status public.provider_status not null default 'pending',
  rating numeric default 0,
  reviews_count int default 0,
  created_at timestamptz default now()
);
create index on public.providers using gin (to_tsvector('russian', coalesce(display_name,'') || ' ' || coalesce(description,'')));

-- ============ ОТЗЫВЫ ============
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.providers(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  rating int check (rating between 1 and 5),
  text text,
  created_at timestamptz default now()
);

-- ============ ХЕЛПЕР: роль ============
create or replace function public.current_role()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean language sql stable as $$
  select coalesce(public.current_role() in ('moderator','admin'), false);
$$;

-- ============ RLS ============
alter table public.profiles  enable row level security;
alter table public.providers enable row level security;
alter table public.reviews   enable row level security;
alter table public.categories enable row level security;

-- profiles
create policy "read self or staff" on public.profiles for select
  using (auth.uid() = id or public.is_staff());
create policy "update self" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "insert self" on public.profiles for insert
  with check (auth.uid() = id);

-- providers: читают все активных; владелец видит свои; staff — всё
create policy "read active" on public.providers for select
  using (status = 'active' or user_id = auth.uid() or public.is_staff());
create policy "insert own" on public.providers for insert
  with check (user_id = auth.uid());
create policy "update own or staff" on public.providers for update
  using (user_id = auth.uid() or public.is_staff());
create policy "delete own or admin" on public.providers for delete
  using (user_id = auth.uid() or public.current_role() = 'admin');

-- reviews
create policy "read all" on public.reviews for select using (true);
create policy "insert own" on public.reviews for insert
  with check (author_id = auth.uid());
create policy "delete staff" on public.reviews for delete
  using (public.is_staff() or author_id = auth.uid());

-- categories
create policy "read all" on public.categories for select using (true);
create policy "admin write" on public.categories for all
  using (public.current_role() = 'admin');

-- ============ СИД КАТЕГОРИЙ ============
insert into public.categories (slug, name) values
  ('repair','Ремонт'),
  ('cleaning','Уборка'),
  ('beauty','Красота'),
  ('it','IT и цифровые услуги'),
  ('auto','Авто'),
  ('education','Обучение')
on conflict do nothing;