-- ตารางโพสต์
create table if not exists posts (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  created_at timestamptz default now() ,
  uid text not null references users(uid)  on delete cascade
);

-- ตารางแท็ก
create table if not exists tags (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz default now()
);

-- ตารางเชื่อมระหว่างโพสต์กับแท็ก (many-to-many)
create table if not exists post_tags (
  post_id bigint not null references posts(id) on delete cascade,
  tag_id bigint not null references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ตารางโค้ดในโพสต์
create table if not exists codes_in_post (
  id bigint generated always as identity primary key,
  post_id bigint not null references posts(id) on delete cascade,
  code text not null,
  language text,
  description text,
  created_at timestamptz default now()
);

-- link ในโพสต์ many to many
create table if not exists links_in_post(
  post_id bigint not null references posts(id) on delete cascade,
  link text not null
)
