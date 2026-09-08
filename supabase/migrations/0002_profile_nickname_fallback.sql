-- ═══════════════════════════════════════════════════════════════
-- 0002 — 닉네임 없이 만들어진 계정도 프로필이 생성되도록
--
-- 문제: 0001 의 handle_new_user 는 raw_user_meta_data->>'nickname' 을
--       그대로 profiles.nickname 에 넣는다. 그런데 nickname 은 NOT NULL
--       이고 2~12자 제약이 있어서, 닉네임이 없는 경로로 계정이 만들어지면
--       트리거가 실패하고 **계정 생성 자체가 롤백된다.**
--
-- 닉네임이 없는 경로:
--   - Supabase 대시보드의 Add user (닉네임 입력란이 없다)
--   - SQL 로 직접 auth.users 에 넣는 경우
--   - 나중에 붙일 소셜 로그인 (카카오 등) — Phase 4
--
-- 해결: 닉네임이 없거나 규칙에 안 맞으면 자동 생성한다.
--       중복이면 숫자를 붙여 회피한다.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $fn$
declare
  supplied text;
  base     text;
  candidate text;
  n        int := 0;
begin
  supplied := nullif(btrim(coalesce(new.raw_user_meta_data->>'nickname', '')), '');

  -- 앱에서 온 닉네임은 zod 로 이미 검증되지만, 다른 경로로 들어온 값도
  -- 있으므로 DB 제약과 같은 규칙을 여기서 한 번 더 확인한다.
  if supplied is not null
     and char_length(supplied) between 2 and 12
     and supplied ~ '^[가-힣a-zA-Z0-9]+$'
  then
    base := supplied;
  else
    -- 예: 회원3f9a2c  (총 8자 — 12자 제한 안에 들어온다)
    base := '회원' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;

  candidate := base;
  -- 중복이면 숫자를 붙인다. 12자를 넘지 않게 앞부분을 자른다.
  while exists (select 1 from public.profiles where nickname = candidate) loop
    n := n + 1;
    candidate := left(base, 12 - char_length(n::text)) || n::text;
    if n > 999 then
      raise exception '닉네임 자동 생성 실패: 후보가 모두 사용 중입니다';
    end if;
  end loop;

  insert into public.profiles (id, nickname) values (new.id, candidate);
  return new;
end;
$fn$;

-- 트리거는 0001 에서 이미 만들어져 있으므로 함수 본문만 교체하면 된다.
-- (create or replace function 이 기존 트리거에 그대로 반영된다)

-- 확인: 아래가 1행이어야 한다
select tgname as 트리거, tgrelid::regclass as 대상
  from pg_trigger
 where tgname = 'on_auth_user_created';
