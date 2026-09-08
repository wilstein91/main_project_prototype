-- ═══════════════════════════════════════════════════════════════
-- 관리자 계정 만들기 (개발용) — SQL Editor 에 붙여넣고 Run
--
-- 이메일 인증을 이미 마친 상태로 계정을 만들고 관리자 권한까지 준다.
-- 메일이 오지 않아 가입을 못 끝내는 상황을 우회하기 위한 것이다.
--
-- ⚠️  실행 전에 아래 세 줄을 반드시 바꾼다.
-- ⚠️  이 파일에 실제 비밀번호를 적어 커밋하지 않는다.
--     (SQL Editor 에 붙여넣을 때만 바꿔서 쓰고, 파일은 그대로 둔다)
--
-- 사전 조건: migrations/0001_init.sql 과 0002_profile_nickname_fallback.sql
--            이 적용되어 있어야 한다.
-- ═══════════════════════════════════════════════════════════════

do $$
declare
  -- ┌──────────────────────────────────────────────────────────┐
  -- │ 여기 세 줄만 바꾼다                                       │
  v_email    text := 'admin@example.com';
  v_password text := 'CHANGE-ME-10자이상';
  v_nickname text := '운영자';
  -- └──────────────────────────────────────────────────────────┘

  v_user_id uuid;
  v_existing uuid;
begin
  if v_password = 'CHANGE-ME-10자이상' then
    raise exception '비밀번호를 바꾸고 다시 실행하세요 (v_password)';
  end if;
  if char_length(v_password) < 10 then
    raise exception '비밀번호는 10자 이상이어야 합니다 (앱의 검증 규칙과 동일)';
  end if;

  select id into v_existing from auth.users where email = lower(v_email);

  if v_existing is not null then
    -- 이미 있으면 비밀번호를 재설정하고 인증 완료 처리한다.
    update auth.users
       set encrypted_password = extensions.crypt(v_password, extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at         = now()
     where id = v_existing;

    update public.profiles
       set role = 'admin', updated_at = now()
     where id = v_existing;

    raise notice '기존 계정의 비밀번호를 재설정하고 관리자로 지정했습니다: %', v_email;
    return;
  end if;

  v_user_id := gen_random_uuid();

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_sso_user, is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id, 'authenticated', 'authenticated',
    lower(v_email),
    extensions.crypt(v_password, extensions.gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nickname', v_nickname),
    false, false
  );

  -- 이메일 로그인에는 identities 행도 필요하다
  insert into auth.identities (
    provider_id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) values (
    v_user_id::text, v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', lower(v_email),
      'email_verified', true,
      'phone_verified', false
    ),
    'email', now(), now(), now()
  );

  -- profiles 행은 on_auth_user_created 트리거가 만든다. 권한만 올린다.
  update public.profiles
     set role = 'admin', updated_at = now()
   where id = v_user_id;

  raise notice '관리자 계정을 만들었습니다: % (닉네임 %)', v_email, v_nickname;
end $$;

-- 확인: role 이 admin 이고 email_confirmed_at 이 채워져 있어야 한다
select p.nickname   as 닉네임,
       p.role       as 권한,
       u.email      as 이메일,
       (u.email_confirmed_at is not null) as 인증완료
  from public.profiles p
  join auth.users u on u.id = p.id
 order by p.created_at desc
 limit 5;
