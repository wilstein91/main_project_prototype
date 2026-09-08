import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  affectedNoRows,
  ANON_TOKEN,
  hasConfig,
  hasMember,
  isRlsViolation,
  MEMBER_EMAIL,
  MEMBER_PASSWORD,
  rest,
  signIn,
} from "./helpers";

/**
 * RLS 정책 검증 — TECH_SPEC §12 / §10.5
 *
 * 실제 DB 를 상대로, 애플리케이션을 거치지 않고 PostgREST 를 직접 호출한다.
 * 화면에서 버튼을 숨기는 것과 정책이 실제로 막는 것은 다른 문제이고,
 * 후자만이 보안이다.
 *
 * 이 파일이 깨지면 접근 통제가 열린 것이다. 기대값을 완화하지 말 것.
 *
 * 실행: npm run test:rls
 * 필요: .env.local 에 SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY /
 *       TEST_MEMBER_EMAIL / TEST_MEMBER_PASSWORD
 *       (계정 생성은 supabase/create_test_member.sql)
 */

const FREE_CATEGORY = 2; // 자유게시판 (write_role = user)
const NOTICE_CATEGORY = 1; // 공지사항  (write_role = admin)

interface PostRow {
  id: number;
  title: string;
  is_pinned: boolean;
  is_deleted: boolean;
  author_id: string | null;
}

describe.skipIf(!hasConfig)("anon (비회원)", () => {
  it("카테고리를 읽을 수 있다", async () => {
    const r = await rest.select<{ slug: string }[]>(
      ANON_TOKEN,
      "categories?select=slug",
    );
    expect(r.status).toBe(200);
    expect(r.body.length).toBeGreaterThan(0);
  });

  it("삭제된 글은 보이지 않는다", async () => {
    const r = await rest.select<unknown[]>(
      ANON_TOKEN,
      "posts?select=id&is_deleted=eq.true",
    );
    expect(r.status).toBe(200);
    expect(r.body).toHaveLength(0);
  });

  it("감사 로그를 읽을 수 없다 (0행)", async () => {
    const r = await rest.select<unknown[]>(ANON_TOKEN, "audit_logs?select=id");
    expect(r.body).toHaveLength(0);
  });

  it("글을 쓸 수 없다", async () => {
    const r = await rest.insert(ANON_TOKEN, "posts", {
      category_id: FREE_CATEGORY,
      author_id: "00000000-0000-0000-0000-000000000000",
      title: "무단 작성",
      content: "anon 이 글쓰기",
    });
    expect(isRlsViolation(r)).toBe(true);
  });

  it("카테고리를 수정할 수 없다", async () => {
    const before = await rest.select<{ name: string }[]>(
      ANON_TOKEN,
      "categories?select=name&slug=eq.free",
    );
    const r = await rest.patch<unknown[]>(
      ANON_TOKEN,
      "categories",
      "slug=eq.free",
      { name: "탈취됨" },
    );
    expect(affectedNoRows(r) || isRlsViolation(r)).toBe(true);

    const after = await rest.select<{ name: string }[]>(
      ANON_TOKEN,
      "categories?select=name&slug=eq.free",
    );
    expect(after.body[0].name).toBe(before.body[0].name);
  });

  it("is_admin() 은 false 다", async () => {
    const r = await rest.rpc<boolean>(ANON_TOKEN, "is_admin");
    expect(r.body).toBe(false);
  });

  it("삭제 함수를 호출할 수 없다", async () => {
    const target = await rest.select<{ id: number }[]>(
      ANON_TOKEN,
      "posts?select=id&is_deleted=eq.false&limit=1",
    );
    if (target.body.length === 0) return;
    const id = target.body[0].id;

    // soft_delete_post 는 SECURITY DEFINER 다. anon 에게 EXECUTE 가
    // 새어 나가면 누구나 아무 글이나 지울 수 있다.
    const r = await rest.rpc(ANON_TOKEN, "soft_delete_post", {
      p_post_id: id,
    });
    expect(r.status).toBeGreaterThanOrEqual(400);

    const after = await rest.select<{ is_deleted: boolean }[]>(
      ANON_TOKEN,
      `posts?select=is_deleted&id=eq.${id}`,
    );
    expect(after.body[0].is_deleted).toBe(false);
  });
});

describe.skipIf(!hasMember)("일반 회원 (authenticated, role=user)", () => {
  let token = "";
  let userId = "";
  const created: number[] = [];

  beforeAll(async () => {
    const s = await signIn(MEMBER_EMAIL, MEMBER_PASSWORD);
    token = s.token;
    userId = s.userId;
  });

  afterAll(async () => {
    // 테스트가 남긴 글을 정리한다.
    //
    // 예전에는 posts 를 직접 PATCH 했다. 그 요청은 42501 로 **전부 실패**
    // 했는데 반환값을 보지 않아서 조용히 넘어갔고, 운영 DB 목록에 테스트
    // 글이 6건 쌓였다. 원인과 해법은 0005 마이그레이션 주석에 있다.
    //
    // 정리가 실패하면 이제 이 훅에서 깨진다. 정리는 테스트의 일부다.
    if (created.length === 0) return;

    for (const id of created) {
      const r = await rest.rpc(token, "soft_delete_post", { p_post_id: id });
      // P0002 = 이미 삭제됨. 삭제 테스트가 먼저 지운 경우다.
      if (r.status >= 400 && r.code !== "P0002") {
        throw new Error(`정리 실패: post ${id} → HTTP ${r.status} ${r.code}`);
      }
    }

    const left = await rest.select<PostRow[]>(
      token,
      `posts?select=id&id=in.(${created.join(",")})`,
    );
    expect(left.body).toHaveLength(0);
  });

  it("관리자가 아니다", async () => {
    const r = await rest.rpc<boolean>(token, "is_admin");
    expect(r.body).toBe(false);
  });

  it("감사 로그를 읽을 수 없다 (0행)", async () => {
    const r = await rest.select<unknown[]>(token, "audit_logs?select=id");
    expect(r.body).toHaveLength(0);
  });

  it("자유게시판에 글을 쓸 수 있다", async () => {
    const r = await rest.insert<PostRow[]>(
      token,
      "posts",
      {
        category_id: FREE_CATEGORY,
        author_id: userId,
        title: "RLS 테스트 글",
        content: "자동 테스트가 만든 글입니다.",
      },
      "?select=id,is_pinned",
    );
    expect(r.status).toBe(201);
    expect(r.body[0].is_pinned).toBe(false);
    created.push(r.body[0].id);
  });

  it("공지 게시판에는 글을 쓸 수 없다 (F-503)", async () => {
    const r = await rest.insert(token, "posts", {
      category_id: NOTICE_CATEGORY,
      author_id: userId,
      title: "무단 공지",
      content: "일반 회원이 공지 작성",
    });
    expect(isRlsViolation(r)).toBe(true);
    expect(r.code).toBe("42501");
  });

  it("글을 고정할 수 없다 — 작성 시 (F-209)", async () => {
    const r = await rest.insert(token, "posts", {
      category_id: FREE_CATEGORY,
      author_id: userId,
      title: "무단 고정",
      content: "일반 회원이 고정",
      is_pinned: true,
    });
    expect(isRlsViolation(r)).toBe(true);
    expect(r.code).toBe("42501");
  });

  it("글을 고정할 수 없다 — 수정 시 (F-209)", async () => {
    expect(created.length).toBeGreaterThan(0);
    const r = await rest.patch(token, "posts", `id=eq.${created[0]}`, {
      is_pinned: true,
    });
    expect(isRlsViolation(r)).toBe(true);
  });

  it("남의 글 제목을 수정할 수 없다", async () => {
    const others = await rest.select<PostRow[]>(
      token,
      `posts?select=id,title&author_id=neq.${userId}&is_deleted=eq.false&limit=1`,
    );
    if (others.body.length === 0) return; // 타인 글이 없으면 건너뛴다

    const target = others.body[0];
    const r = await rest.patch<unknown[]>(token, "posts", `id=eq.${target.id}`, {
      title: "탈취된 제목",
    });
    expect(affectedNoRows(r) || isRlsViolation(r)).toBe(true);

    const after = await rest.select<PostRow[]>(
      token,
      `posts?select=title&id=eq.${target.id}`,
    );
    expect(after.body[0].title).toBe(target.title);
  });

  /**
   * 이 테스트가 없어서 삭제 버그가 오래 살아 있었다.
   *
   * '남의 글을 삭제할 수 없다' 는 통과하고 있었지만, 사실은 **본인 글까지
   * 포함해 모든 삭제가 막혀 있었기** 때문에 통과한 거짓 통과였다.
   * 막혀야 하는 것만 검사하면 이런 실패를 못 잡는다 — 통해야 하는 것도
   * 같은 강도로 검사한다.
   */
  it("자기 글을 삭제할 수 있다 (F-206)", async () => {
    const made = await rest.insert<PostRow[]>(token, "posts", {
      category_id: FREE_CATEGORY,
      author_id: userId,
      title: "삭제 경로 테스트",
      content: "이 글은 같은 테스트 안에서 지워진다",
    });
    expect(made.status).toBe(201);
    const id = made.body[0].id;
    created.push(id); // 삭제가 실패하면 afterAll 이 치운다

    const r = await rest.rpc(token, "soft_delete_post", { p_post_id: id });
    expect(r.status).toBeLessThan(300);

    // 삭제된 글은 작성자 본인에게도 보이지 않는다 (posts_select 유지)
    const after = await rest.select<PostRow[]>(
      token,
      `posts?select=id&id=eq.${id}`,
    );
    expect(after.body).toHaveLength(0);
  });

  it("남의 글을 삭제할 수 없다", async () => {
    const others = await rest.select<PostRow[]>(
      token,
      `posts?select=id&author_id=neq.${userId}&is_deleted=eq.false&limit=1`,
    );
    if (others.body.length === 0) return;

    const id = others.body[0].id;

    // 경로 1 — 테이블 직접 UPDATE
    const direct = await rest.patch<unknown[]>(token, "posts", `id=eq.${id}`, {
      is_deleted: true,
    });
    expect(affectedNoRows(direct) || isRlsViolation(direct)).toBe(true);

    // 경로 2 — 삭제 함수. SECURITY DEFINER 라 RLS 를 우회하므로,
    // 함수 안의 권한 검사가 유일한 방어선이다. 반드시 직접 확인한다.
    const viaFn = await rest.rpc(token, "soft_delete_post", { p_post_id: id });
    expect(viaFn.status).toBeGreaterThanOrEqual(400);

    const after = await rest.select<PostRow[]>(
      token,
      `posts?select=is_deleted&id=eq.${id}`,
    );
    expect(after.body[0].is_deleted).toBe(false);
  });

  it("남의 댓글을 수정할 수 없다", async () => {
    const others = await rest.select<{ id: number; content: string }[]>(
      token,
      `comments?select=id,content&author_id=neq.${userId}&is_deleted=eq.false&limit=1`,
    );
    if (others.body.length === 0) return;

    const target = others.body[0];
    const r = await rest.patch<unknown[]>(
      token,
      "comments",
      `id=eq.${target.id}`,
      { content: "탈취된 댓글" },
    );
    expect(affectedNoRows(r) || isRlsViolation(r)).toBe(true);

    const after = await rest.select<{ content: string }[]>(
      token,
      `comments?select=content&id=eq.${target.id}`,
    );
    expect(after.body[0].content).toBe(target.content);
  });

  it("대댓글은 1단계까지만 만들 수 있다 (F-302)", async () => {
    // 자기 글에 댓글 → 답글 → 답글의 답글(차단)
    const post = await rest.insert<PostRow[]>(
      token,
      "posts",
      {
        category_id: FREE_CATEGORY,
        author_id: userId,
        title: "대댓글 깊이 테스트",
        content: "자동 테스트",
      },
      "?select=id",
    );
    const postId = post.body[0].id;
    created.push(postId);

    const root = await rest.insert<{ id: number }[]>(
      token,
      "comments",
      { post_id: postId, author_id: userId, content: "최상위" },
      "?select=id",
    );
    expect(root.status).toBe(201);

    const reply = await rest.insert<{ id: number }[]>(
      token,
      "comments",
      {
        post_id: postId,
        author_id: userId,
        parent_id: root.body[0].id,
        content: "1단계 답글",
      },
      "?select=id",
    );
    expect(reply.status).toBe(201);

    // 2단계 — 트리거가 막아야 한다
    const deep = await rest.insert(token, "comments", {
      post_id: postId,
      author_id: userId,
      parent_id: reply.body[0].id,
      content: "2단계 답글",
    });
    expect(deep.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(deep.body)).toContain("대댓글은 1단계");
  });

  it("comment_count 가 실제 댓글 수와 일치한다 (F-304)", async () => {
    const post = await rest.insert<PostRow[]>(
      token,
      "posts",
      {
        category_id: FREE_CATEGORY,
        author_id: userId,
        title: "댓글 수 트리거 테스트",
        content: "자동 테스트",
      },
      "?select=id",
    );
    const postId = post.body[0].id;
    created.push(postId);

    const c1 = await rest.insert<{ id: number }[]>(
      token,
      "comments",
      { post_id: postId, author_id: userId, content: "1" },
      "?select=id",
    );
    await rest.insert(token, "comments", {
      post_id: postId,
      author_id: userId,
      content: "2",
    });

    let p = await rest.select<{ comment_count: number }[]>(
      token,
      `posts?select=comment_count&id=eq.${postId}`,
    );
    expect(p.body[0].comment_count).toBe(2);

    // 하나를 소프트 삭제하면 1로 줄어야 한다
    await rest.patch(token, "comments", `id=eq.${c1.body[0].id}`, {
      is_deleted: true,
    });
    p = await rest.select<{ comment_count: number }[]>(
      token,
      `posts?select=comment_count&id=eq.${postId}`,
    );
    expect(p.body[0].comment_count).toBe(1);
  });

  it("남의 프로필을 수정할 수 없다", async () => {
    const others = await rest.select<{ id: string; nickname: string }[]>(
      token,
      `profiles?select=id,nickname&id=neq.${userId}&limit=1`,
    );
    if (others.body.length === 0) return;

    const target = others.body[0];
    const r = await rest.patch<unknown[]>(
      token,
      "profiles",
      `id=eq.${target.id}`,
      { nickname: "탈취닉" },
    );
    expect(affectedNoRows(r) || isRlsViolation(r)).toBe(true);

    const after = await rest.select<{ nickname: string }[]>(
      token,
      `profiles?select=nickname&id=eq.${target.id}`,
    );
    expect(after.body[0].nickname).toBe(target.nickname);
  });

  it("스스로 관리자가 될 수 없다", async () => {
    const r = await rest.patch<unknown[]>(token, "profiles", `id=eq.${userId}`, {
      role: "admin",
    });
    // profiles_update_own 은 통과하지만 role 은 바뀌면 안 된다.
    // 현재 정책은 컬럼을 제한하지 않으므로, 바뀌었다면 정책을 고쳐야 한다.
    const after = await rest.select<{ role: string }[]>(
      token,
      `profiles?select=role&id=eq.${userId}`,
    );
    expect(after.body[0].role, "일반 회원이 스스로 admin 이 되었다").toBe("user");
    void r;
  });
});
