-- ═══════════════════════════════════════════════════════════════
-- 0006 — soft_delete_post 의 EXECUTE 권한을 anon 에서 실제로 회수
--
-- ## 무엇이 안 먹었나
--
-- 0005 는 이렇게 끝난다.
--
--   revoke execute on function public.soft_delete_post(bigint) from public;
--   grant  execute on function public.soft_delete_post(bigint) to authenticated;
--
-- 적용 후 확인해 보니 `has_function_privilege('anon', ...)` 가 **true** 였다.
-- 회수했는데 남아 있다.
--
-- ## 왜 남아 있나
--
-- PostgreSQL 은 함수를 만들면 EXECUTE 를 `PUBLIC`(모든 역할) 에 자동으로
-- 준다. `revoke ... from public` 은 그 자동 부여만 없앤다.
--
-- 그런데 Supabase 는 public 스키마에 **기본 권한(default privileges)** 을
-- 걸어 두어, 새로 만든 함수에 `anon` / `authenticated` / `service_role`
-- 로 **직접 부여**가 함께 생긴다. 직접 부여는 PUBLIC 회수와 별개라
-- 그대로 살아남는다.
--
-- 즉 Supabase 에서는 `revoke ... from public` 만으로 비회원 접근이
-- 막히지 않는다. **역할 이름을 적어 회수해야 한다.**
--
-- ## 지금 실제로 뚫렸던 것은 아니다
--
-- 비회원이 이 함수를 호출해도 삭제되지 않는다. 함수 안에서
-- `auth.uid()` 로 작성자를 확인하고 42501 을 던지기 때문이다 (실제로
-- 401 + '권한이 없습니다' 를 확인했고, 대상 글은 그대로였다).
--
-- 그래도 고치는 이유는 두 가지다.
--   1. 0005 가 **의도한 방어 한 겹이 조용히 적용되지 않았다.** 함수 안
--      검사를 나중에 누가 느슨하게 바꾸면 그날 바로 열린다.
--   2. 비회원이 호출해 P0002(없는 글) / 42501(남의 글) 로 글 id 존재
--      여부를 떠볼 수 있다. 지금은 어차피 목록이 공개라 실익이 없지만,
--      비공개 게시판이 생기면 정보 노출이 된다.
--
-- ## 다른 함수는 어떤가
--
-- `increment_view_count` 와 `is_nickname_available` 은 **비회원도 써야
-- 하므로** anon 부여가 의도된 것이다 (0001). 트리거 함수
-- (`handle_new_user` 등)는 반환형이 trigger 라 PostgREST 로 호출할 수
-- 없다. 그래서 이 마이그레이션은 soft_delete_post 하나만 다룬다.
--
-- **앞으로 SECURITY DEFINER 함수를 추가할 때마다** 역할 이름을 적어
-- 회수하고, 아래 판정 쿼리로 확인한다.
-- ═══════════════════════════════════════════════════════════════

revoke execute on function public.soft_delete_post(bigint) from public;
revoke execute on function public.soft_delete_post(bigint) from anon;
grant  execute on function public.soft_delete_post(bigint) to authenticated;

-- ── 확인 ───────────────────────────────────────────────────────
-- 참/거짓 대신 판정 문장을 낸다. 컬럼 이름에 기대값을 적고 값에 true /
-- false 를 내면 "false여야함 = true" 처럼 읽혀 무엇이 정상인지 알 수 없다.
select
  case
    when has_function_privilege('anon', 'public.soft_delete_post(bigint)', 'execute')
    then '문제 — 비회원이 삭제 함수를 실행할 수 있습니다'
    else '정상 — 비회원 실행 차단됨'
  end as 비회원_권한,
  case
    when has_function_privilege('authenticated', 'public.soft_delete_post(bigint)', 'execute')
    then '정상 — 회원 실행 가능'
    else '문제 — 회원이 삭제 함수를 실행할 수 없습니다 (글 삭제가 안 됩니다)'
  end as 회원_권한;

-- ── 원인 기록용 ────────────────────────────────────────────────
-- public 스키마의 기본 권한 설정. anon 이 여기 들어 있으면, 앞으로
-- 만드는 함수도 같은 이유로 anon 부여를 달고 태어난다.
select
  defaclrole::regrole as 설정한_역할,
  case defaclobjtype when 'f' then '함수' when 'r' then '테이블'
                     when 'S' then '시퀀스' else defaclobjtype::text end as 대상,
  defaclacl as 기본권한
from pg_default_acl
where defaclnamespace = 'public'::regnamespace;
