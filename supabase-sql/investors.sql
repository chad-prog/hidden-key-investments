create table investors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  accredited boolean,
  notes text,
  created timestamptz default now()
);
