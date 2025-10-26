create table opportunities (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  value numeric not null,
  stage text,
  notes text,
  created timestamptz default now()
);
