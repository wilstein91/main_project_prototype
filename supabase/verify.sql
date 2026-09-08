-- ═══════════════════════════════════════════════════════════════
-- 0001_init.sql 이 끝까지 적용됐는지 확인한다.
--
-- 사용법: Supabase → SQL Editor → New query → 이 파일 전체 붙여넣고 Run
--         (읽기만 하므로 몇 번 돌려도 안전하다)
--
-- 쿼리 3개가 순서대로 실행되고, 결과 탭을 넘겨가며 볼 수 있다.
-- ═══════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────
-- [1] 테이블 · 함수 · 트리거가 다 있는지
--     기대: 15행 모두 '✅ 있음'
-- ───────────────────────────────────────────────────────────────
with expected(kind, name) as (
  values
    ('1.table',   'profiles'),
    ('1.table',   'categories'),
    ('1.table',   'posts'),
    ('1.table',   'comments'),
    ('1.table',   'audit_logs'),
    ('2.function','is_admin'),
    ('2.function','is_nickname_available'),
    ('2.function','handle_new_user'),
    ('2.function','sync_comment_count'),
    ('2.function','enforce_comment_depth'),
    ('2.function','increment_view_count'),
    ('3.trigger', 'on_auth_user_created'),
    ('3.trigger', 'comments_count_sync'),
    ('3.trigger', 'comments_depth_check'),
    ('4.seed',    'categories 5건')
),
actual(kind, name) as (
  select '1.table', tablename
    from pg_tables where schemaname = 'public'
  union all
  select '2.function', p.proname
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
  union all
  select '3.trigger', tgname
    from pg_trigger where not tgisinternal
  union all
  select '4.seed', 'categories 5건'
   where (select count(*) from public.categories) = 5
)
select e.kind                                              as 구분,
       e.name                                              as 이름,
       case when a.name is null then '❌ 없음' else '✅ 있음' end as 상태
  from expected e
  left join actual a on a.kind = e.kind and a.name = e.name
 order by e.kind, e.name;


-- ───────────────────────────────────────────────────────────────
-- [2] RLS 가 켜져 있고 정책 수가 맞는지
--     기대: rls_켜짐 전부 true
--           audit_logs 2 / categories 2 / comments 4 / posts 4 / profiles 2
--           (합계 14)
-- ───────────────────────────────────────────────────────────────
select t.tablename                       as 테이블,
       t.rowsecurity                     as rls_켜짐,
       (select count(*)
          from pg_policies p
         where p.schemaname = 'public'
           and p.tablename = t.tablename) as 정책수
  from pg_tables t
 where t.schemaname = 'public'
 order by t.tablename;


-- ───────────────────────────────────────────────────────────────
-- [3] 카테고리 시드
--     기대: notice / free / stock / market / qna 5건
--           notice 만 write_role = admin
-- ───────────────────────────────────────────────────────────────
select sort_order as 순서,
       slug,
       name       as 이름,
       write_role as 쓰기권한
  from public.categories
 order by sort_order;
