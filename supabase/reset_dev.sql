-- ═══════════════════════════════════════════════════════════════
-- ⚠️  파괴적 스크립트 — 개발 초기에만 쓴다
--
-- 0001_init.sql 이 중간에 실패해 일부만 만들어졌을 때, 깨끗이 지우고
-- 처음부터 다시 적용하기 위한 것이다.
--
-- 실행하면 게시글·댓글·프로필이 전부 삭제된다.
-- 회원 데이터가 하나라도 생긴 뒤에는 절대 실행하지 않는다.
--
-- 회원 계정(auth.users)은 지우지 않는다. 계정까지 지우려면
-- Dashboard → Authentication → Users 에서 직접 삭제한다.
-- (profiles 가 사라진 계정으로 로그인하면 화면이 비정상 동작하므로,
--  이 스크립트를 돌린 뒤에는 기존 계정도 함께 정리하는 편이 좋다)
--
-- 사용 순서:
--   1) 이 파일 전체를 SQL Editor 에 붙여넣고 Run
--   2) 이어서 migrations/0001_init.sql 을 붙여넣고 Run
--   3) verify.sql 로 확인
-- ═══════════════════════════════════════════════════════════════

-- auth 스키마의 트리거를 먼저 떼어낸다 (함수보다 먼저)
drop trigger if exists on_auth_user_created on auth.users;

-- 테이블 (의존 순서 역순, cascade 로 정책·인덱스·트리거 함께 제거)
drop table if exists public.audit_logs cascade;
drop table if exists public.comments  cascade;
drop table if exists public.posts     cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles  cascade;

-- 함수
drop function if exists public.handle_new_user()              cascade;
drop function if exists public.sync_comment_count()           cascade;
drop function if exists public.enforce_comment_depth()        cascade;
drop function if exists public.is_admin()                     cascade;
drop function if exists public.is_nickname_available(text)     cascade;
drop function if exists public.increment_view_count(bigint)    cascade;

-- 확인: 아래 결과가 0행이어야 한다
select tablename from pg_tables where schemaname = 'public';
