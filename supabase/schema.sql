-- Create settings table
create table if not exists public.settings (
  key text not null primary key,
  value text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.settings enable row level security;

-- Policies
create policy "Enable read access for all users"
on public.settings for select
using (true);

create policy "Enable insert/update for authenticated users"
on public.settings for insert
with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users"
on public.settings for update
using (auth.role() = 'authenticated');
