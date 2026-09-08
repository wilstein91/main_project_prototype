-- ═══════════════════════════════════════════════════════════════
-- auth.users 행 복구 — "Database error querying schema" 대응
--
-- 증상: 특정 계정으로 로그인 시도하면 HTTP 500
--       {"error_code":"unexpected_failure",
--        "msg":"Database error querying schema"}
--       다른(없는) 이메일로는 정상적으로 invalid_credentials 가 나온다.
--
-- 원인: SQL 로 직접 만들거나 수정한 auth.users 행에는 토큰 관련 컬럼들이
--       NULL 로 남을 수 있다. 인증 서버(GoTrue)는 이 컬럼들을 문자열로
--       읽으므로 NULL 이면 조회 자체가 실패한다. 대시보드로 만든 계정에는
--       빈 문자열('')이 들어가서 이 문제가 없다.
--
-- 이 스크립트는 NULL 을 빈 문자열로 채운다. 여러 번 실행해도 안전하다.
-- ═══════════════════════════════════════════════════════════════

-- ── [1] 현재 상태 진단 ──────────────────────────────────────────
select u.email                                as 이메일,
       p.nickname                             as 닉네임,
       p.role                                 as 권한,
       (u.email_confirmed_at is not null)     as 인증완료,
       (u.encrypted_password is not null)     as 비밀번호있음,
       -- 아래가 하나라도 true 면 그게 500 의 원인이다
       (u.confirmation_token is null)         as null_confirmation_token,
       (u.recovery_token is null)             as null_recovery_token,
       (u.email_change is null)               as null_email_change,
       (u.email_change_token_new is null)     as null_email_change_token_new,
       (u.email_change_token_current is null) as null_email_change_token_cur,
       (u.phone_change is null)               as null_phone_change,
       (u.phone_change_token is null)         as null_phone_change_token,
       (u.reauthentication_token is null)     as null_reauth_token,
       (select count(*) from auth.identities i where i.user_id = u.id) as identity수
  from auth.users u
  left join public.profiles p on p.id = u.id
 order by u.created_at desc;


-- ── [2] 복구 ────────────────────────────────────────────────────
update auth.users
   set confirmation_token         = coalesce(confirmation_token, ''),
       recovery_token             = coalesce(recovery_token, ''),
       email_change               = coalesce(email_change, ''),
       email_change_token_new     = coalesce(email_change_token_new, ''),
       email_change_token_current = coalesce(email_change_token_current, ''),
       phone_change               = coalesce(phone_change, ''),
       phone_change_token         = coalesce(phone_change_token, ''),
       reauthentication_token     = coalesce(reauthentication_token, ''),
       updated_at                 = now()
 where confirmation_token is null
    or recovery_token is null
    or email_change is null
    or email_change_token_new is null
    or email_change_token_current is null
    or phone_change is null
    or phone_change_token is null
    or reauthentication_token is null;


-- ── [3] 복구 확인: null_ 로 시작하는 칸이 모두 false 여야 한다 ──
select u.email                                as 이메일,
       (u.confirmation_token is null)         as null_confirmation_token,
       (u.recovery_token is null)             as null_recovery_token,
       (u.email_change is null)               as null_email_change,
       (u.email_change_token_new is null)     as null_email_change_token_new,
       (u.email_change_token_current is null) as null_email_change_token_cur,
       (u.phone_change is null)               as null_phone_change,
       (u.phone_change_token is null)         as null_phone_change_token,
       (u.reauthentication_token is null)     as null_reauth_token
  from auth.users u
 order by u.created_at desc;
