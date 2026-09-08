-- ═══════════════════════════════════════════════════════════════
-- 일반 회원 테스트 계정 (개발용) — SQL Editor 에 붙여넣고 Run
--
-- 왜 필요한가: 회원이 관리자 1명뿐이면 아래를 검증할 수 없다.
--   - 감사 로그(D-4): 관리자가 **타인** 글을 삭제해야 기록된다
--   - RLS: 타인 글 수정·삭제 차단
--   - F-209: 일반 회원이 공지 고정을 시도했을 때 차단되는지
--   - F-503: 일반 회원이 공지 게시판에 쓰려 했을 때 차단되는지
--
-- 이메일 인증을 마친 상태로 만들고, 권한은 일반 회원(user)으로 둔다.
-- create_admin.sql 과 달리 토큰 컬럼을 처음부터 '' 로 채운다 —
-- NULL 로 남기면 인증 서버가 조회에 실패한다 (repair_auth_user.sql 참고).
--
-- ⚠️  검증이 끝나면 지운다: supabase/drop_test_member.sql
-- ═══════════════════════════════════════════════════════════════

do $$
declare
  -- ┌──────────────────────────────────────────────────────────┐
  v_email    text := 'tester@namjosunhero.local';
  v_password text := 'TestMember-2026!';
  v_nickname text := '테스트회원';
  -- └──────────────────────────────────────────────────────────┘

  v_user_id  uuid;
  v_existing uuid;
begin
  select id into v_existing from auth.users where email = lower(v_email);

  if v_existing is not null then
    update auth.users
       set encrypted_password         = extensions.crypt(v_password, extensions.gen_salt('bf')),
           email_confirmed_at         = coalesce(email_confirmed_at, now()),
           confirmation_token         = coalesce(confirmation_token, ''),
           recovery_token             = coalesce(recovery_token, ''),
           email_change               = coalesce(email_change, ''),
           email_change_token_new     = coalesce(email_change_token_new, ''),
           email_change_token_current = coalesce(email_change_token_current, ''),
           phone_change               = coalesce(phone_change, ''),
           phone_change_token         = coalesce(phone_change_token, ''),
           reauthentication_token     = coalesce(reauthentication_token, ''),
           updated_at                 = now()
     where id = v_existing;
    raise notice '기존 테스트 계정 비밀번호를 재설정했습니다: %', v_email;
    return;
  end if;

  v_user_id := gen_random_uuid();

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_sso_user, is_anonymous,
    -- 이 컬럼들을 NULL 로 남기면 GoTrue 가 사용자 조회에 실패한다
    confirmation_token, recovery_token, email_change,
    email_change_token_new, email_change_token_current,
    phone_change, phone_change_token, reauthentication_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id, 'authenticated', 'authenticated', lower(v_email),
    extensions.crypt(v_password, extensions.gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nickname', v_nickname),
    false, false,
    '', '', '', '', '', '', '', ''
  );

  insert into auth.identities (
    provider_id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) values (
    v_user_id::text, v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', lower(v_email),
                       'email_verified', true, 'phone_verified', false),
    'email', now(), now(), now()
  );

  -- profiles 행은 on_auth_user_created 트리거가 만든다.
  -- 권한은 기본값 'user' 로 둔다 (관리자로 올리지 않는다).
  raise notice '테스트 회원을 만들었습니다: % / %', v_email, v_password;
end $$;

select p.nickname   as 닉네임,
       p.role       as 권한,
       u.email      as 이메일,
       (u.email_confirmed_at is not null) as 인증완료
  from public.profiles p
  join auth.users u on u.id = p.id
 order by p.created_at;
