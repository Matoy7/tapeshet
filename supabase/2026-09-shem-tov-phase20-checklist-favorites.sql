-- ---------------------------------------------------------------------------
-- טפשת — phase 20: persist "אזור אישי"'s checklist selections and
-- professional favorites, so they survive a page refresh instead of living
-- only in React state.
--
-- Run once in the Supabase SQL Editor, after phase 13.
--
-- Baby-gear items, "לפני שיוצאים" checklist items, and professionals are not
-- rows in their own Postgres tables (they're hardcoded in
-- src/data/babyGear.ts / src/data/leaving.ts / src/data/professionals.ts),
-- so unlike name_favorites.name_id these three tables reference an item by
-- its plain string id (e.g. "mom-1", "car-2") rather than a uuid foreign
-- key — there is nothing in the database for it to reference.
--
-- Same personal-save shape as name_favorites otherwise: one row per
-- (user, item), no family, no shared/group state, RLS scoped to the owning
-- user only.
-- ---------------------------------------------------------------------------

create table if not exists public.gear_checklist (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  item_id    text not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create table if not exists public.leaving_checklist (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  item_id    text not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create table if not exists public.professional_favorites (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  professional_id text not null,
  created_at      timestamptz not null default now(),
  unique (user_id, professional_id)
);

create index if not exists gear_checklist_user_id_idx on public.gear_checklist (user_id);
create index if not exists leaving_checklist_user_id_idx on public.leaving_checklist (user_id);
create index if not exists professional_favorites_user_id_idx on public.professional_favorites (user_id);

alter table public.gear_checklist enable row level security;
alter table public.leaving_checklist enable row level security;
alter table public.professional_favorites enable row level security;

grant select, insert, delete on public.gear_checklist to authenticated;
grant select, insert, delete on public.leaving_checklist to authenticated;
grant select, insert, delete on public.professional_favorites to authenticated;

-- gear_checklist ---------------------------------------------------------

drop policy if exists "a user may see their own gear checklist" on public.gear_checklist;
create policy "a user may see their own gear checklist"
  on public.gear_checklist for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "a user may check a gear item for themselves" on public.gear_checklist;
create policy "a user may check a gear item for themselves"
  on public.gear_checklist for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "a user may uncheck their own gear item" on public.gear_checklist;
create policy "a user may uncheck their own gear item"
  on public.gear_checklist for delete to authenticated
  using ((select auth.uid()) = user_id);

-- leaving_checklist -------------------------------------------------------

drop policy if exists "a user may see their own leaving checklist" on public.leaving_checklist;
create policy "a user may see their own leaving checklist"
  on public.leaving_checklist for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "a user may check a leaving item for themselves" on public.leaving_checklist;
create policy "a user may check a leaving item for themselves"
  on public.leaving_checklist for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "a user may uncheck their own leaving item" on public.leaving_checklist;
create policy "a user may uncheck their own leaving item"
  on public.leaving_checklist for delete to authenticated
  using ((select auth.uid()) = user_id);

-- professional_favorites ---------------------------------------------------

drop policy if exists "a user may see their own professional favorites" on public.professional_favorites;
create policy "a user may see their own professional favorites"
  on public.professional_favorites for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "a user may favorite a professional for themselves" on public.professional_favorites;
create policy "a user may favorite a professional for themselves"
  on public.professional_favorites for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "a user may remove their own professional favorite" on public.professional_favorites;
create policy "a user may remove their own professional favorite"
  on public.professional_favorites for delete to authenticated
  using ((select auth.uid()) = user_id);
