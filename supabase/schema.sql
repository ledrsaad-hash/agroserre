-- ============================================================
-- AgroSerre — Schéma Supabase
-- À coller et exécuter dans Supabase > SQL Editor > New Query
-- ============================================================

-- ── SERRES ────────────────────────────────────────────────────
create table if not exists public.serres (
  id             text primary key,
  user_id        uuid references auth.users(id) on delete cascade not null,
  nom            text not null,
  localisation   text,
  superficie     numeric,
  "nombrePlants" integer,
  "dateCreation" text not null,
  notes          text,
  "createdAt"    text not null,
  "updatedAt"    text not null
);

alter table public.serres enable row level security;

create policy "serres_select" on public.serres for select using (auth.uid() = user_id);
create policy "serres_insert" on public.serres for insert with check (auth.uid() = user_id);
create policy "serres_update" on public.serres for update using (auth.uid() = user_id);
create policy "serres_delete" on public.serres for delete using (auth.uid() = user_id);

create index if not exists serres_user_id_idx on public.serres(user_id);

-- ── DÉPENSES ──────────────────────────────────────────────────
create table if not exists public.depenses (
  id              text primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  date            text not null,
  "serreId"       text,
  categorie       text not null,
  "sousType"      text,
  description     text not null,
  montant         numeric not null,
  devise          text not null default 'MAD',
  "modePaiement"  text,
  note            text,
  "createdAt"     text not null,
  "updatedAt"     text not null
);

alter table public.depenses enable row level security;

create policy "depenses_select" on public.depenses for select using (auth.uid() = user_id);
create policy "depenses_insert" on public.depenses for insert with check (auth.uid() = user_id);
create policy "depenses_update" on public.depenses for update using (auth.uid() = user_id);
create policy "depenses_delete" on public.depenses for delete using (auth.uid() = user_id);

create index if not exists depenses_user_id_idx on public.depenses(user_id);
create index if not exists depenses_serre_idx   on public.depenses("serreId");

-- ── ACTIONS ───────────────────────────────────────────────────
create table if not exists public.actions (
  id             text primary key,
  user_id        uuid references auth.users(id) on delete cascade not null,
  date           text not null,
  "serreId"      text not null,
  type           text not null,
  description    text not null,
  "coutAssocie"  numeric,
  note           text,
  "createdAt"    text not null,
  "updatedAt"    text not null
);

alter table public.actions enable row level security;

create policy "actions_select" on public.actions for select using (auth.uid() = user_id);
create policy "actions_insert" on public.actions for insert with check (auth.uid() = user_id);
create policy "actions_update" on public.actions for update using (auth.uid() = user_id);
create policy "actions_delete" on public.actions for delete using (auth.uid() = user_id);

create index if not exists actions_user_id_idx on public.actions(user_id);
create index if not exists actions_serre_idx   on public.actions("serreId");

-- ── INTRANTS ──────────────────────────────────────────────────
create table if not exists public.intrants (
  id                 text primary key,
  user_id            uuid references auth.users(id) on delete cascade not null,
  date               text not null,
  "serreId"          text not null,
  "typeIntrant"      text not null,
  "nomProduit"       text not null,
  quantite           numeric not null,
  unite              text not null,
  cout               numeric not null,
  "modeApplication"  text,
  note               text,
  "createdAt"        text not null,
  "updatedAt"        text not null
);

alter table public.intrants enable row level security;

create policy "intrants_select" on public.intrants for select using (auth.uid() = user_id);
create policy "intrants_insert" on public.intrants for insert with check (auth.uid() = user_id);
create policy "intrants_update" on public.intrants for update using (auth.uid() = user_id);
create policy "intrants_delete" on public.intrants for delete using (auth.uid() = user_id);

create index if not exists intrants_user_id_idx on public.intrants(user_id);

-- ── VENTES ────────────────────────────────────────────────────
create table if not exists public.ventes (
  id                      text primary key,
  user_id                 uuid references auth.users(id) on delete cascade not null,
  date                    text not null,
  "typeAffectation"       text not null,
  "serreIds"              text[] not null default '{}',
  repartitions            jsonb not null default '[]',
  "nombreRegimesTotal"    integer not null,
  "tonnageBrutTotal"      numeric not null,
  "prixAuKg"              numeric not null,
  "pourcentageCharges"    numeric not null,
  "chargesFixes"          jsonb,
  acheteur                text,
  "lieuVente"             text,
  note                    text,
  "createdAt"             text not null,
  "updatedAt"             text not null
);

alter table public.ventes enable row level security;

create policy "ventes_select" on public.ventes for select using (auth.uid() = user_id);
create policy "ventes_insert" on public.ventes for insert with check (auth.uid() = user_id);
create policy "ventes_update" on public.ventes for update using (auth.uid() = user_id);
create policy "ventes_delete" on public.ventes for delete using (auth.uid() = user_id);

create index if not exists ventes_user_id_idx on public.ventes(user_id);

-- ── PRIX MARCHÉ ───────────────────────────────────────────────
create table if not exists public.prix_marche (
  id          text primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  date        text not null,
  "prixKg"    numeric not null,
  marche      text,
  ville       text,
  note        text,
  "createdAt" text not null
);

alter table public.prix_marche enable row level security;

create policy "prix_marche_select" on public.prix_marche for select using (auth.uid() = user_id);
create policy "prix_marche_insert" on public.prix_marche for insert with check (auth.uid() = user_id);
create policy "prix_marche_update" on public.prix_marche for update using (auth.uid() = user_id);
create policy "prix_marche_delete" on public.prix_marche for delete using (auth.uid() = user_id);

create index if not exists prix_marche_user_id_idx on public.prix_marche(user_id);
