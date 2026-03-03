-- 在 Supabase SQL Editor 中执行，创建 beta 白名单表
-- Run in Supabase Dashboard -> SQL Editor

create table if not exists public.beta_allowlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

create index if not exists idx_beta_allowlist_email_active
  on public.beta_allowlist (email) where is_active = true;

-- 示例：添加测试邮箱
-- insert into public.beta_allowlist (email, is_active) values ('your@email.com', true);
