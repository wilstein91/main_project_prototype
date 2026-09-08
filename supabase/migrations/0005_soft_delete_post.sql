-- ═══════════════════════════════════════════════════════════════
-- 0005 — 글 삭제를 함수로 옮긴다 (버그 수정)
--
-- ## 증상
--
-- 회원이 자기 글의 [삭제] 를 눌러도 아무 일도 일어나지 않았다.
-- 관리자는 정상 삭제된다.
--
-- ## 원인
--
-- 삭제는 `is_deleted = true` UPDATE 다. 정책상 통과해야 하는 조건은
--
--   posts_update_own  using (auth.uid() = author_id and is_deleted = false)
--                     with check (auth.uid() = author_id and ...)
--
-- 뿐이고, 여기에 걸릴 이유가 없다. 실제로 title 만 바꾸는 UPDATE 는 200 이다.
-- 그런데 is_deleted 를 true 로 바꾸는 UPDATE 만 42501 이 난다.
--
-- PostgREST 는 영향 행 수를 세기 위해 모든 쓰기를 RETURNING 이 달린
-- CTE 로 실행한다 (`Prefer: return=minimal` 이어도 마찬가지다).
-- PostgreSQL 은 **RETURNING 이 붙은 UPDATE 의 결과 행에 SELECT 정책까지**
-- 적용한다. 그리고 이 프로젝트의 SELECT 정책은
--
--   posts_select  using (is_deleted = false or public.is_admin())
--
-- 이라서, 방금 is_deleted = true 가 된 행은 작성자 본인에게 더 이상
-- 보이지 않는다 → "new row violates row-level security policy".
--
-- 대조군으로 확인했다. comments 는 `comments_select using (true)` 라서
-- 같은 소프트 삭제가 204 로 성공한다. 차이는 SELECT 정책뿐이다.
--
-- ## 두 가지 선택지
--
-- (A) posts_select 에 `or auth.uid() = author_id` 를 더한다.
--     한 줄이면 되지만 **읽기 권한을 넓히는** 수정이다. 작성자에게는
--     삭제한 글이 목록·상세·검색에 다시 보이기 시작하므로, is_deleted
--     필터가 빠진 질의가 하나라도 있으면 그대로 노출된다.
--     삭제 버그를 고치려고 열람 범위를 건드리는 것은 교환비가 나쁘다.
--
-- (B) 삭제만 SECURITY DEFINER 함수로 옮긴다. 읽기 정책은 그대로 두고,
--     권한 검사는 함수 안에서 명시적으로 한다.
--
-- (B) 를 택한다. 조회수 증가(increment_view_count)도 같은 이유로
-- 이미 함수다 — RLS 를 우회해야 하는 단일 목적 연산은 정책을 넓히는
-- 대신 좁은 함수 하나로 처리한다는 기존 방침을 따른다.
--
-- ## SECURITY DEFINER 를 쓸 때의 주의
--
-- 이 함수는 소유자 권한으로 돌아 RLS 를 건너뛴다. 따라서 권한 검사를
-- 빠뜨리면 그 자체가 취약점이다. 세 가지를 지켰다.
--
--   1. search_path 를 public 으로 고정한다 (검색 경로 가로채기 방지)
--   2. anon 에게는 EXECUTE 를 주지 않는다
--   3. 권한 비교에 coalesce 를 쓴다. `v_author = auth.uid()` 는
--      비로그인일 때 NULL 이고, `if not NULL` 은 거짓이므로 검사 없이
--      통과해 버린다. 이 NULL 함정이 이 함수의 유일한 위험이다.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.soft_delete_post(p_post_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_author uuid;
begin
  -- 이미 삭제된 글은 v_author 가 NULL 이 되어 아래에서 걸린다
  select author_id into v_author
    from public.posts
   where id = p_post_id and is_deleted = false;

  if v_author is null then
    raise exception '글을 찾을 수 없습니다' using errcode = 'P0002';
  end if;

  -- coalesce 필수 — 주석 3번 참고
  if not coalesce(v_author = auth.uid(), false) and not public.is_admin() then
    raise exception '권한이 없습니다' using errcode = '42501';
  end if;

  update public.posts
     set is_deleted = true,
         updated_at = now()
   where id = p_post_id;
end;
$fn$;

revoke execute on function public.soft_delete_post(bigint) from public;
grant  execute on function public.soft_delete_post(bigint) to authenticated;

-- ── 확인 ───────────────────────────────────────────────────────
-- authenticated 에만 EXECUTE 가 있어야 한다. anon 이 보이면 잘못된 것이다.
select
  r.rolname as 역할,
  has_function_privilege(r.rolname, 'public.soft_delete_post(bigint)', 'execute') as 실행권한
from (values ('anon'), ('authenticated')) as r(rolname);
