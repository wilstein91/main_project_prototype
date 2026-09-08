-- ═══════════════════════════════════════════════════════════════
-- 0003 — 공지 고정(is_pinned)은 관리자만
--
-- F-209 를 구현하려면 is_pinned 를 설정하는 UI 가 필요한데, 화면에서
-- 체크박스를 관리자에게만 보여주는 것으로는 부족하다. 폼을 조작하면
-- 일반 회원도 자기 글을 목록 최상단에 고정할 수 있다.
--
-- 권한 검사는 DB 에 둔다 (TECH_SPEC §2.1). posts_insert / posts_update_own
-- 정책에 is_pinned 조건을 추가한다.
--
-- 관리자는 posts_admin_all 정책으로 통과하므로 영향받지 않는다.
-- ═══════════════════════════════════════════════════════════════

-- ── INSERT: 일반 회원은 is_pinned = false 로만 작성 가능 ────────
drop policy if exists posts_insert on public.posts;

create policy posts_insert on public.posts
  for insert to authenticated with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.categories c
       where c.id = category_id
         and c.is_active
         and (c.write_role = 'user' or public.is_admin())
    )
    -- 고정은 관리자만
    and (is_pinned = false or public.is_admin())
  );

-- ── UPDATE: 일반 회원은 자기 글을 고정할 수 없다 ───────────────
drop policy if exists posts_update_own on public.posts;

create policy posts_update_own on public.posts
  for update to authenticated
  using (auth.uid() = author_id and is_deleted = false)
  with check (
    auth.uid() = author_id
    and (is_pinned = false or public.is_admin())
  );

-- ── 확인: posts 정책 4개가 보여야 한다 ─────────────────────────
select policyname as 정책, cmd as 동작
  from pg_policies
 where schemaname = 'public' and tablename = 'posts'
 order by policyname;
