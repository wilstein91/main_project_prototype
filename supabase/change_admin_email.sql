-- ═══════════════════════════════════════════════════════════════
-- 관리자 계정의 이메일(로그인 ID) 바꾸기 — SQL Editor 에 붙여넣고 Run
--
-- role = 'admin' 인 계정을 찾아서 이메일만 교체한다. 기존 이메일을
-- 정확히 몰라도 된다.
--
-- 이메일 인증 상태(email_confirmed_at)는 유지되므로, 바꾼 뒤에도
-- 메일 없이 바로 로그인된다.
--
-- ⚠️  아래 v_new_email 만 바꾼다. 비밀번호도 같이 바꾸려면
--     v_new_password 에 값을 넣고, 그대로 두려면 빈 문자열로 남긴다.
-- ⚠️  실제 값을 적어 커밋하지 않는다. SQL Editor 에서만 바꿔 쓴다.
-- ═══════════════════════════════════════════════════════════════

do $$
declare
  -- ┌──────────────────────────────────────────────────────────┐
  v_new_email    text := 'here@example.com';
  v_new_password text := '';   -- 비우면 비밀번호는 그대로 둔다
  -- └──────────────────────────────────────────────────────────┘

  v_user_id  uuid;
  v_old      text;
  v_admins   int;
begin
  if v_new_email = 'here@example.com' then
    raise exception '새 이메일을 적고 다시 실행하세요 (v_new_email)';
  end if;
  if position('@' in v_new_email) = 0 then
    raise exception '이메일 형식이 아닙니다: %', v_new_email;
  end if;

  select count(*) into v_admins from public.profiles where role = 'admin';
  if v_admins = 0 then
    raise exception '관리자 계정이 없습니다. create_admin.sql 을 먼저 실행하세요';
  end if;
  if v_admins > 1 then
    raise exception '관리자가 % 명입니다. 이 스크립트는 1명일 때만 안전합니다', v_admins;
  end if;

  select u.id, u.email into v_user_id, v_old
    from public.profiles p
    join auth.users u on u.id = p.id
   where p.role = 'admin';

  -- 바꿀 주소가 다른 계정이 이미 쓰고 있으면 중단한다 (email UNIQUE)
  if exists (
    select 1 from auth.users
     where email = lower(v_new_email) and id <> v_user_id
  ) then
    raise exception '이미 다른 계정이 쓰는 이메일입니다: %', lower(v_new_email);
  end if;

  update auth.users
     set email      = lower(v_new_email),
         updated_at = now(),
         -- 인증 상태는 유지한다 (메일 없이 로그인 가능하게)
         email_confirmed_at = coalesce(email_confirmed_at, now()),
         encrypted_password =
           case when v_new_password = '' then encrypted_password
                else extensions.crypt(v_new_password, extensions.gen_salt('bf'))
           end
   where id = v_user_id;

  -- identities 쪽 이메일도 같이 맞춘다. 안 맞추면 로그인 조회가 어긋날 수 있다.
  update auth.identities
     set identity_data = identity_data
                         || jsonb_build_object('email', lower(v_new_email)),
         updated_at    = now()
   where user_id = v_user_id and provider = 'email';

  if v_new_password = '' then
    raise notice '이메일을 % → % 로 바꿨습니다 (비밀번호 유지)', v_old, lower(v_new_email);
  else
    raise notice '이메일을 % → % 로 바꾸고 비밀번호도 재설정했습니다', v_old, lower(v_new_email);
  end if;
end $$;

-- 확인: 이메일이 바뀌고 인증완료가 true 여야 한다
select p.nickname   as 닉네임,
       p.role       as 권한,
       u.email      as 로그인_이메일,
       (u.email_confirmed_at is not null) as 인증완료
  from public.profiles p
  join auth.users u on u.id = p.id
 order by p.created_at desc;
