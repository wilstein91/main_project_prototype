// ─────────────────────────────────────────────────────────────
// 형상 확인용 시드 데이터
//
// Supabase 연결(T-07~T-10) 후 이 파일은 삭제한다.
// queries.ts 의 함수 시그니처만 유지하면 호출부는 바뀌지 않는다.
// ─────────────────────────────────────────────────────────────

import type { Category, Comment, Post, Profile } from "@/types/db";

export const profiles: Profile[] = [
  {
    id: "u-admin",
    nickname: "운영자",
    role: "admin",
    status: "active",
    nickname_changed_at: null,
    created_at: "2026-08-01T09:00:00+09:00",
  },
  {
    id: "u-001",
    nickname: "달러사냥꾼",
    role: "user",
    status: "active",
    nickname_changed_at: null,
    created_at: "2026-08-12T09:00:00+09:00",
  },
  {
    id: "u-002",
    nickname: "존버맨",
    role: "user",
    status: "active",
    nickname_changed_at: null,
    created_at: "2026-08-14T09:00:00+09:00",
  },
  {
    id: "u-003",
    nickname: "코스피관찰자",
    role: "user",
    status: "active",
    nickname_changed_at: null,
    created_at: "2026-08-20T09:00:00+09:00",
  },
  {
    id: "u-004",
    nickname: "초보투자",
    role: "user",
    status: "active",
    nickname_changed_at: null,
    created_at: "2026-09-01T09:00:00+09:00",
  },
];

export const categories: Category[] = [
  {
    id: 1,
    slug: "notice",
    name: "공지사항",
    description: "서비스 운영에 관한 공지입니다.",
    sort_order: 1,
    write_role: "admin",
    is_active: true,
  },
  {
    id: 2,
    slug: "free",
    name: "자유게시판",
    description: "주제 제한 없이 자유롭게 이야기하는 곳입니다.",
    sort_order: 2,
    write_role: "user",
    is_active: true,
  },
  {
    id: 3,
    slug: "stock",
    name: "종목토론",
    description: "개별 종목에 대한 의견을 나눕니다.",
    sort_order: 3,
    write_role: "user",
    is_active: true,
  },
  {
    id: 4,
    slug: "market",
    name: "시황·뉴스",
    description: "시장 흐름과 뉴스를 공유합니다.",
    sort_order: 4,
    write_role: "user",
    is_active: true,
  },
  {
    id: 5,
    slug: "qna",
    name: "질문답변",
    description: "모르는 것을 묻고 답하는 곳입니다.",
    sort_order: 5,
    write_role: "user",
    is_active: true,
  },
];

export const posts: Post[] = [
  {
    id: 1,
    category_id: 1,
    author_id: "u-admin",
    title: "영웅호걸닷컴 커뮤니티 이용 안내",
    content: `영웅호걸닷컴에 오신 것을 환영합니다.

이곳은 개인 투자자들이 정보와 의견을 나누는 커뮤니티입니다. 운영진은 서비스 운영에 관한 공지만 게시하며, 특정 종목의 매수·매도를 권유하거나 투자 조언을 제공하지 않습니다.

아래 게시물은 작성이 금지됩니다.

- 시세조종 또는 부정거래를 목적으로 하는 글
- 허위 또는 오해를 유발하는 정보
- 대가를 받고 특정 종목을 권유하는 글
- 원금이나 수익률을 보장한다는 취지의 글

편하게, 그러나 서로 존중하며 이용해 주세요.`,
    view_count: 412,
    comment_count: 2,
    is_pinned: true,
    is_deleted: false,
    created_at: "2026-09-01T10:00:00+09:00",
    updated_at: "2026-09-01T10:00:00+09:00",
    edited_at: null,
  },
  {
    id: 2,
    category_id: 4,
    author_id: "u-001",
    title: "환율 1,380원대 다시 올라왔는데 다들 어떻게 보시나요",
    content: `지난주에 1,350원까지 내려왔다가 다시 올라왔습니다.

수출주 입장에서는 나쁘지 않은데, 해외주식 새로 사기에는 부담스러운 구간이네요. 분할로 접근하시는 분들 계신가요?`,
    view_count: 238,
    comment_count: 3,
    is_pinned: false,
    is_deleted: false,
    created_at: "2026-09-07T21:14:00+09:00",
    updated_at: "2026-09-07T21:14:00+09:00",
    edited_at: null,
  },
  {
    id: 3,
    category_id: 3,
    author_id: "u-002",
    title: "반도체 섹터 실적 발표 일정 정리해봤습니다",
    content: `이번 분기 주요 업체 실적 발표 일정입니다. 날짜는 현지 기준이고 변동될 수 있습니다.

정리하면서 느낀 건데, 예상치 자체보다 가이던스 톤이 더 중요해 보입니다. 지난 분기에도 숫자는 좋았는데 가이던스에서 빠졌으니까요.

각자 보시는 포인트가 있으면 댓글로 공유해 주세요.`,
    view_count: 517,
    comment_count: 1,
    is_pinned: false,
    is_deleted: false,
    created_at: "2026-09-07T14:32:00+09:00",
    updated_at: "2026-09-07T18:02:00+09:00",
    edited_at: "2026-09-07T18:02:00+09:00",
  },
  {
    id: 4,
    category_id: 5,
    author_id: "u-004",
    title: "ETF 분배금은 자동으로 재투자되는 건가요?",
    content: `주식은 좀 해봤는데 ETF는 처음입니다.

분배금이 나온다고 하는데 계좌에 현금으로 들어오는 건지, 자동으로 다시 사주는 건지 헷갈립니다. 상품마다 다른 건가요?`,
    view_count: 96,
    comment_count: 2,
    is_pinned: false,
    is_deleted: false,
    created_at: "2026-09-07T09:48:00+09:00",
    updated_at: "2026-09-07T09:48:00+09:00",
    edited_at: null,
  },
  {
    id: 5,
    category_id: 2,
    author_id: "u-003",
    title: "장 마감하고 나서야 마음이 편해지는 게 정상인가요",
    content: `요즘 장 열려 있는 동안은 아무것도 못 합니다.

계좌를 안 보려고 앱을 지웠는데 웹으로 봅니다. 다들 어떻게 견디시나요.`,
    view_count: 341,
    comment_count: 4,
    is_pinned: false,
    is_deleted: false,
    created_at: "2026-09-06T16:05:00+09:00",
    updated_at: "2026-09-06T16:05:00+09:00",
    edited_at: null,
  },
  {
    id: 6,
    category_id: 3,
    author_id: "u-001",
    title: "배당주 포트폴리오 비중 어떻게 잡고 계신가요",
    content: `현재 배당주 40%, 성장주 40%, 현금 20%로 두고 있습니다.

나이대나 목표에 따라 다를 텐데, 참고삼아 다른 분들 비중이 궁금합니다. 종목명은 없어도 되고 비중만요.`,
    view_count: 187,
    comment_count: 0,
    is_pinned: false,
    is_deleted: false,
    created_at: "2026-09-06T11:20:00+09:00",
    updated_at: "2026-09-06T11:20:00+09:00",
    edited_at: null,
  },
  {
    id: 7,
    category_id: 4,
    author_id: "u-003",
    title: "금리 인하 기대가 이미 반영된 걸까요",
    content: `채권 쪽 움직임 보면 이미 상당 부분 반영된 것 같은데, 주식은 아직 반응이 덜한 느낌입니다.

제가 뭘 놓치고 있는지 짚어주시면 감사하겠습니다.`,
    view_count: 274,
    comment_count: 1,
    is_pinned: false,
    is_deleted: false,
    created_at: "2026-09-05T20:41:00+09:00",
    updated_at: "2026-09-05T20:41:00+09:00",
    edited_at: null,
  },
  {
    id: 8,
    category_id: 2,
    author_id: "u-002",
    title: "3년 존버 결과 공유 (feat. 중간에 두 번 팔았음)",
    content: `제목은 존버인데 사실 두 번 팔았습니다.

한 번은 무서워서, 한 번은 급전 때문에. 결과적으로 안 팔았으면 더 좋았겠지만 그때 판 게 잘못된 판단이었다고는 생각하지 않습니다.

느낀 점은 하나입니다. 버틸 수 있는 금액만 넣어야 버틸 수 있습니다.`,
    view_count: 892,
    comment_count: 3,
    is_pinned: false,
    is_deleted: false,
    created_at: "2026-09-05T13:17:00+09:00",
    updated_at: "2026-09-05T13:17:00+09:00",
    edited_at: null,
  },
  {
    id: 9,
    category_id: 5,
    author_id: "u-004",
    title: "해외주식 양도소득세 신고 처음인데 순서가 어떻게 되나요",
    content: `작년에 처음으로 해외주식을 팔았습니다.

증권사에서 자료를 준다고는 하는데 그다음에 뭘 해야 하는지 모르겠습니다. 경험 있으신 분 순서만 알려주시면 찾아보겠습니다.`,
    view_count: 143,
    comment_count: 2,
    is_pinned: false,
    is_deleted: false,
    created_at: "2026-09-04T22:03:00+09:00",
    updated_at: "2026-09-04T22:03:00+09:00",
    edited_at: null,
  },
  {
    id: 10,
    category_id: 1,
    author_id: "u-admin",
    title: "닉네임 변경 정책 안내 (30일 1회)",
    content: `닉네임은 30일에 한 번 변경할 수 있습니다.

무분별한 변경으로 인한 혼선을 막기 위한 정책입니다. 프로필 설정에서 변경 가능 여부를 확인하실 수 있습니다.`,
    view_count: 158,
    comment_count: 0,
    is_pinned: true,
    is_deleted: false,
    created_at: "2026-09-03T09:30:00+09:00",
    updated_at: "2026-09-03T09:30:00+09:00",
    edited_at: null,
  },
  {
    id: 11,
    category_id: 2,
    author_id: "u-001",
    title: "삭제된 글 예시 (관리자 삭제 확인용)",
    content: "규정 위반으로 삭제된 게시물입니다.",
    view_count: 12,
    comment_count: 0,
    is_pinned: false,
    is_deleted: true,
    created_at: "2026-09-02T15:00:00+09:00",
    updated_at: "2026-09-02T16:00:00+09:00",
    edited_at: null,
  },
];

export const comments: Comment[] = [
  {
    id: 1,
    post_id: 1,
    author_id: "u-001",
    parent_id: null,
    content: "안내 감사합니다. 규정 잘 지키겠습니다.",
    is_deleted: false,
    created_at: "2026-09-01T11:20:00+09:00",
    updated_at: "2026-09-01T11:20:00+09:00",
  },
  {
    id: 2,
    post_id: 1,
    author_id: "u-004",
    parent_id: null,
    content: "가입했습니다. 잘 부탁드립니다.",
    is_deleted: false,
    created_at: "2026-09-02T08:05:00+09:00",
    updated_at: "2026-09-02T08:05:00+09:00",
  },
  {
    id: 3,
    post_id: 2,
    author_id: "u-002",
    parent_id: null,
    content:
      "저는 환율 구간 나눠서 기계적으로 분할 매수하고 있습니다. 맞추려고 하면 계속 틀리더라고요.",
    is_deleted: false,
    created_at: "2026-09-07T21:40:00+09:00",
    updated_at: "2026-09-07T21:40:00+09:00",
  },
  {
    id: 4,
    post_id: 2,
    author_id: "u-001",
    parent_id: 3,
    content: "구간은 몇 원 단위로 나누시나요?",
    is_deleted: false,
    created_at: "2026-09-07T22:02:00+09:00",
    updated_at: "2026-09-07T22:02:00+09:00",
  },
  {
    id: 5,
    post_id: 2,
    author_id: "u-003",
    parent_id: null,
    content: "삭제된 댓글 예시입니다.",
    is_deleted: true,
    created_at: "2026-09-07T22:30:00+09:00",
    updated_at: "2026-09-07T23:00:00+09:00",
  },
  {
    id: 6,
    post_id: 3,
    author_id: "u-003",
    parent_id: null,
    content: "정리 감사합니다. 가이던스 톤 말씀에 동의합니다.",
    is_deleted: false,
    created_at: "2026-09-07T15:10:00+09:00",
    updated_at: "2026-09-07T15:10:00+09:00",
  },
  {
    id: 7,
    post_id: 4,
    author_id: "u-002",
    parent_id: null,
    content:
      "상품마다 다릅니다. 분배금을 지급하는 상품과 내부에서 재투자하는 상품이 따로 있어서, 상품 설명서에서 확인하시는 게 확실합니다.",
    is_deleted: false,
    created_at: "2026-09-07T10:20:00+09:00",
    updated_at: "2026-09-07T10:20:00+09:00",
  },
  {
    id: 8,
    post_id: 4,
    author_id: "u-004",
    parent_id: 7,
    content: "감사합니다. 설명서 찾아보겠습니다.",
    is_deleted: false,
    created_at: "2026-09-07T10:35:00+09:00",
    updated_at: "2026-09-07T10:35:00+09:00",
  },
  {
    id: 9,
    post_id: 5,
    author_id: "u-001",
    parent_id: null,
    content: "저도 그랬습니다. 비중을 줄이니까 좀 나아졌습니다.",
    is_deleted: false,
    created_at: "2026-09-06T16:40:00+09:00",
    updated_at: "2026-09-06T16:40:00+09:00",
  },
  {
    id: 10,
    post_id: 5,
    author_id: "u-002",
    parent_id: null,
    content: "알림을 다 끄는 게 도움이 되더라고요.",
    is_deleted: false,
    created_at: "2026-09-06T17:12:00+09:00",
    updated_at: "2026-09-06T17:12:00+09:00",
  },
  {
    id: 11,
    post_id: 5,
    author_id: "u-004",
    parent_id: 10,
    content: "이거 해보겠습니다.",
    is_deleted: false,
    created_at: "2026-09-06T18:00:00+09:00",
    updated_at: "2026-09-06T18:00:00+09:00",
  },
  {
    id: 12,
    post_id: 5,
    author_id: "u-003",
    parent_id: null,
    content: "정상입니다. 저는 아직도 그렇습니다.",
    is_deleted: false,
    created_at: "2026-09-06T19:22:00+09:00",
    updated_at: "2026-09-06T19:22:00+09:00",
  },
  {
    id: 13,
    post_id: 7,
    author_id: "u-002",
    parent_id: null,
    content: "채권과 주식의 반응 속도 차이는 원래 있는 편입니다.",
    is_deleted: false,
    created_at: "2026-09-05T21:15:00+09:00",
    updated_at: "2026-09-05T21:15:00+09:00",
  },
  {
    id: 14,
    post_id: 8,
    author_id: "u-004",
    parent_id: null,
    content: "마지막 문장이 제일 와닿습니다.",
    is_deleted: false,
    created_at: "2026-09-05T14:02:00+09:00",
    updated_at: "2026-09-05T14:02:00+09:00",
  },
  {
    id: 15,
    post_id: 8,
    author_id: "u-003",
    parent_id: null,
    content: "급전 때문에 판 건 어쩔 수 없죠. 고생하셨습니다.",
    is_deleted: false,
    created_at: "2026-09-05T15:30:00+09:00",
    updated_at: "2026-09-05T15:30:00+09:00",
  },
  {
    id: 16,
    post_id: 8,
    author_id: "u-001",
    parent_id: null,
    content: "3년 버틴 것 자체가 대단합니다.",
    is_deleted: false,
    created_at: "2026-09-05T16:44:00+09:00",
    updated_at: "2026-09-05T16:44:00+09:00",
  },
  {
    id: 17,
    post_id: 9,
    author_id: "u-002",
    parent_id: null,
    content:
      "증권사 자료 받으신 다음에 신고 기간에 맞춰 진행하시면 됩니다. 국세청 안내 페이지에 순서가 정리되어 있습니다.",
    is_deleted: false,
    created_at: "2026-09-04T22:40:00+09:00",
    updated_at: "2026-09-04T22:40:00+09:00",
  },
  {
    id: 18,
    post_id: 9,
    author_id: "u-004",
    parent_id: 17,
    content: "감사합니다. 찾아보겠습니다.",
    is_deleted: false,
    created_at: "2026-09-04T23:05:00+09:00",
    updated_at: "2026-09-04T23:05:00+09:00",
  },
];
