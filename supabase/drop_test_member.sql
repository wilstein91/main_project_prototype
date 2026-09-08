-- ═══════════════════════════════════════════════════════════════
-- 테스트 회원 삭제 — 권한 검증이 끝난 뒤 실행한다
--
-- create_test_member.sql 로 만든 계정과 그 계정이 남긴 글·댓글을
-- 함께 지운다.
--
-- ⚠️  실제 회원이 생긴 뒤에는 이메일을 반드시 확인하고 실행할 것.
-- ═══════════════════════════════════════════════════════════════

do $$
declare
  v_email   text := 'tester@namjosunhero.local';
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = lower(v_email);
  if v_user_id is null then
    raise notice '해당 계정이 없습니다: %', v_email;
    return;
  end if;

  -- 이 계정이 쓴 글·댓글을 실제로 삭제한다 (소프트 삭제가 아니라 제거)
  delete from public.comments where author_id = v_user_id;
  delete from public.posts    where author_id = v_user_id;
  delete from public.audit_logs where actor_id = v_user_id;

  -- profiles 는 auth.users 삭제 시 on delete cascade 로 함께 지워진다
  delete from auth.identities where user_id = v_user_id;
  delete from auth.users      where id = v_user_id;

  raise notice '테스트 계정과 작성물을 삭제했습니다: %', v_email;
end $$;

select p.nickname as 닉네임, p.role as 권한
  from public.profiles p
 order by p.created_at;
