-- ═══════════════════════════════════════════════════════════════
-- 0004 — 권한 상승 차단 (보안 수정)
--
-- 발견: RLS 테스트(tests/rls/policies.test.ts)가 잡아냈다.
--       일반 회원이 자기 프로필의 role 을 'admin' 으로 바꿀 수 있었다.
--
-- 원인: profiles_update_own 정책이 "자기 행" 만 제한하고 "어떤 컬럼" 은
--       제한하지 않았다.
--
--         for update using (auth.uid() = id) with check (auth.uid() = id)
--
--       RLS 정책으로는 이걸 막을 수 없다 — UPDATE 정책의 WITH CHECK 는
--       변경 후 값만 보고, 변경 전 값과 비교할 수 없다. 그래서
--       "role 을 바꾸지 말라" 를 정책 표현식으로 쓸 방법이 없다.
--
-- 해결: 컬럼 단위 UPDATE 권한을 쓴다. 회원이 바꿔도 되는 컬럼만 준다.
--       role 은 아무도(앱을 통해서는) 바꿀 수 없다.
--
-- 관리자 승격은 계속 SQL Editor 에서 한다 (postgres 역할은 이 제한을
-- 받지 않는다). 앱에서 역할을 바꿀 일이 생기면 SECURITY DEFINER 함수를
-- 따로 만들고 그 함수에만 권한을 준다.
-- ═══════════════════════════════════════════════════════════════

-- ── 테이블 전체 UPDATE 권한을 회수하고 필요한 컬럼만 다시 준다 ──
revoke update on public.profiles from authenticated, anon;

-- 회원이 바꿀 수 있는 것: 닉네임(F-106), 탈퇴 상태(F-107), 갱신 시각
grant update (nickname, nickname_changed_at, status, updated_at)
  on public.profiles to authenticated;

-- anon 은 프로필을 수정할 이유가 전혀 없다 (읽기만 허용)
-- 위 revoke 로 이미 제거됨.

-- ── 확인 [1] 컬럼 권한: 4개 행만 나와야 한다 ───────────────────
select grantee   as 대상,
       column_name as 컬럼,
       privilege_type as 권한
  from information_schema.column_privileges
 where table_schema = 'public'
   and table_name = 'profiles'
   and privilege_type = 'UPDATE'
   and grantee in ('authenticated', 'anon')
 order by grantee, column_name;

-- ── 확인 [2] role 이 잘못 올라간 계정을 되돌린다 ───────────────
-- 테스트로 admin 이 된 계정을 user 로 복구한다.
-- 진짜 관리자 닉네임을 확인하고 실행할 것.
update public.profiles
   set role = 'user', updated_at = now()
 where nickname = '테스트회원' and role = 'admin';

-- ── 확인 [3] 최종 상태 ─────────────────────────────────────────
select nickname as 닉네임, role as 권한, status as 상태
  from public.profiles
 order by created_at;
