-- Run this once in the Supabase SQL editor for your project

create table if not exists messages (
  id          uuid        primary key default gen_random_uuid(),
  room_id     text        not null,
  sender      text        not null,
  text        text        not null,
  created_at  timestamptz not null default now()
);

create index if not exists messages_room_id_idx on messages (room_id, created_at);

alter table messages enable row level security;

-- Anonymous burner chat: anyone can read, write, and delete
create policy "read"   on messages for select using (true);
create policy "insert" on messages for insert with check (true);
create policy "delete" on messages for delete using (true);

-- Enable Realtime for INSERT events
alter publication supabase_realtime add table messages;
