# 자문사 트랙 — 이 저장소에서 내보낸 자료

> **읽는 사람**: 자문·일임사 웹사이트를 만드는 사람(또는 그 세션의 AI).
> 이 저장소(`영웅호걸닷컴` 커뮤니티)에 있던 자문사 트랙을 2026-09-09 에
> 걷어냈다. **지운 것이 아니라 옮긴 것이며, 옮길 곳이 아직 없어서 여기
> 보관한다.** 자문사 사이트 저장소가 생기면 이 파일째 옮기고 여기서 지운다.

---

## 1. 왜 뺐나

PRD v0.4 에서 세 가지가 연달아 정해졌다.

1. **유료 구독·멤버십 전면 제외** — 이 커뮤니티는 전 기능 무료다
2. **FAQ·문의를 별도 자문사 웹사이트로 분리**
3. 이 커뮤니티의 성격은 **자문·일임사로 가는 유입 경로**이지 자문 서비스의
   일부가 아니다

그러면 `/company`(자문사 소개)·`/advisory`(자문 서비스 안내)·리서치 게시판만
이 저장소에 남을 이유가 없다. 셋 다 **자문사가 자기 사이트에서 해야 하는
말**이다. PRD **O-9** 가 이것을 물었고, 옮기는 것으로 결정했다.

### 뺐더니 좋아진 것

트랙 분리(PRD §3)는 **한 사이트 안에 규제 대상과 비대상이 섞여 있어서**
필요했던 구조다. 자문사 트랙이 나가면 이 사이트는 **전부 커뮤니티**이고,
게이트라는 개념 자체가 필요 없어진다. 지킬 것이 줄어드는 쪽이 안전하다.

### 대신 반드시 남겨둔 것

푸터의 **`자문업 등록·신고번호: 해당 없음 (미신고)`** 표기는 그대로 둔다.
이것은 자문사에 관한 정보가 아니라 **이 사이트가 자문사가 아니라는 고지**다
(PRD C-3 · §3.7). 빼면 오히려 위험해진다.

---

## 2. 옮길 때 지켜야 하는 규제 조건

> 아래는 실무 관행을 참고한 정리이며 법률 자문이 아니다. **정식 공개 전
> 변호사 검토를 받아야 한다** (PRD O-2).

| | |
|---|---|
| `/company` (자문사 소개) | **법인 설립 완료** 후 공개 |
| `/advisory` (자문 서비스 안내) | **자문업 신고 또는 등록 완료** 후 공개 |
| 리서치 게시판 | **자문업 신고 또는 등록 완료** 후 공개 |

**절차 전에는 페이지를 404 로 둔다.** 링크만 숨기는 것으로는 부족하다 —
주소를 직접 치면 열리기 때문이다. 아래 `UnderConstruction` 방식은 "준비 중"
안내를 띄우는 중간 상태이며, **자문 서비스 안내는 준비 중 페이지조차
띄우지 않고 404 로 두는 것이 안전하다** (미신고 상태에서 자문 관련 안내가
노출되는 것 자체가 리스크).

### ⚠️ 커뮤니티에서 자문사로 링크를 걸 때

커뮤니티 사이트에 자문사 사이트로 가는 링크를 넣는 기능은 만들어 두었지만
**꺼져 있다** (`src/config/company.ts` 의 `advisorySiteUrl: null`).

**자문업 신고·등록이 실제로 끝난 뒤에만 켠다.** 등록 전에 링크를 켜면
커뮤니티가 미등록 자문 서비스를 광고하는 모양이 되어, 커뮤니티 트랙까지
규제 대상으로 끌고 들어간다. 이 커뮤니티의 규제 안전성이 걸린 스위치다.

---

## 3. 옮기는 코드

### 3.1 게이트 상태 정의

세 단계로 나눴다. 자문사 사이트에서도 같은 구조를 쓰면 된다.

| 상태 | 라우트 | 링크 | 검색 노출 |
|---|---|---|---|
| `hidden` | 404 | 렌더링하지 않음 | 없음 |
| `under_construction` | 준비 중 안내 + 법적 고지 | 클릭 불가 + 배지 | `noindex` |
| `live` | 정상 | 정상 | 정상 |

```ts
export type GateState = "hidden" | "under_construction" | "live";

export type AdvisoryFeature =
  | "companyIntro" //  자문사 소개 /company
  | "advisoryIntro" // 자문 서비스 안내 /advisory
  | "researchBoard"; // 리서치 게시판

const ADVISORY: Record<
  AdvisoryFeature,
  { state: GateState; unblockedBy: string }
> = {
  companyIntro: {
    state: "under_construction",
    unblockedBy: "법인 설립 완료",
  },
  advisoryIntro: {
    state: "hidden",
    unblockedBy: "자문업 신고·등록 완료",
  },
  researchBoard: {
    state: "hidden",
    unblockedBy: "자문업 신고·등록 완료",
  },
};

export function gate(k: AdvisoryFeature): GateState {
  return ADVISORY[k].state;
}
export function unblockedBy(k: AdvisoryFeature): string {
  return ADVISORY[k].unblockedBy;
}
export const isLive = (k: AdvisoryFeature) => gate(k) === "live";
export const isVisible = (k: AdvisoryFeature) => gate(k) !== "hidden";
```

### 3.2 페이지 — 게이트 판정은 서버에서

**클라이언트에서 숨기면 안 된다.** `hidden` 상태의 콘텐츠가 자바스크립트
번들에 포함되어 열람 가능해진다.

```tsx
// app/company/page.tsx
import { notFound } from "next/navigation";
import { UnderConstruction } from "@/components/gate/UnderConstruction";
import { gate } from "@/config/features";

const STATE = gate("companyIntro");

export const metadata = {
  title: "회사 소개",
  robots: STATE === "live" ? undefined : { index: false, follow: false },
};

export default function CompanyPage() {
  if (STATE === "hidden") notFound();
  if (STATE === "under_construction") {
    return <UnderConstruction featureKey="companyIntro" />;
  }
  return (
    <div className="px-4 py-6 lg:px-6 lg:py-0">
      <h1 className="text-[26px] font-bold text-ink">회사 소개</h1>
    </div>
  );
}
```

`app/advisory/page.tsx` 도 같은 형태이며 `featureKey` 만 `advisoryIntro` 로
바뀐다.

### 3.3 준비 중 안내 컴포넌트

막다른 길을 만들지 않으려고 돌아갈 경로를 함께 뒀다.

```tsx
// components/gate/UnderConstruction.tsx
import { ButtonLink } from "@/components/ui/Button";
import { unblockedBy, type AdvisoryFeature } from "@/config/features";
import { UNDER_CONSTRUCTION_NOTICE } from "@/config/legal";

export function UnderConstruction({
  featureKey,
}: {
  featureKey: AdvisoryFeature;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 lg:px-6">
      <div className="mb-8">
        <p className="mb-2 text-meta font-semibold text-ink-sub">준비 중</p>
        <h1 className="text-2xl font-bold leading-snug text-ink">
          {UNDER_CONSTRUCTION_NOTICE.heading}
        </h1>
      </div>

      <div className="rounded-[var(--radius-md)] bg-surface p-5">
        <dl className="flex flex-col gap-2 text-meta">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-ink-sub">공개 조건</dt>
            <dd className="font-medium text-ink">{unblockedBy(featureKey)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-ink-sub">공개 시점</dt>
            <dd className="font-medium text-ink">절차 완료 후 별도 공지</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex flex-col gap-4 text-[14px] leading-[1.75] text-ink-sub">
        {UNDER_CONSTRUCTION_NOTICE.paragraphs.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>

      <div className="mt-8">
        <ButtonLink href="/" variant="secondary">
          커뮤니티 둘러보기
        </ButtonLink>
      </div>
    </div>
  );
}
```

### 3.4 게이트 링크

비활성일 때 `<a>` 를 쓰지 않는다. 죽은 링크에 키보드 초점이 걸리면
탭으로 이동했을 때 아무 일도 일어나지 않아 이용자가 멈춘다.

```tsx
// components/gate/GatedLink.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { gate, type FeatureKey } from "@/config/features";
import { Badge } from "@/components/ui/Badge";

export function GatedLink({
  featureKey,
  href,
  children,
  className = "",
}: {
  featureKey: FeatureKey;
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const state = gate(featureKey);

  if (state === "hidden") return null;

  if (state === "under_construction") {
    return (
      <span
        role="link"
        aria-disabled="true"
        tabIndex={-1}
        title="설립 절차 완료 후 공개됩니다"
        className={`flex cursor-not-allowed items-center justify-between gap-2 text-ink-sub/70 ${className}`}
      >
        <span>{children}</span>
        <Badge tone="muted">준비 중</Badge>
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
```

### 3.5 sitemap · robots 연동

게이트가 `live` 가 아니면 사이트맵에서 빼고 크롤링을 막는다.

```ts
// sitemap.ts
if (isLive("companyIntro")) {
  entries.push({ url: `${SITE_URL}/company`, priority: 0.4 });
}
if (isLive("advisoryIntro")) {
  entries.push({ url: `${SITE_URL}/advisory`, priority: 0.4 });
}

// robots.ts
if (!isLive("companyIntro")) disallow.push("/company");
if (!isLive("advisoryIntro")) disallow.push("/advisory");
```

---

## 4. 고지문 초안 (PRD 부록 A-1)

> 실무 관행을 참고한 **초안**이며 법률 자문이 아니다. 공개 전 변호사 검토
> 필수. 이 문구는 `config/legal.ts` 같은 설정 파일에 두고 컴포넌트에
> 하드코딩하지 않는다 — 검토 후 수정될 값이다.

**제목**

> 본 페이지는 현재 준비 중입니다.

**본문**

> 본 페이지에서 안내할 예정인 투자자문 관련 서비스는 아직 제공되지
> 않습니다. 운영 주체는 「자본시장과 금융투자업에 관한 법률」에 따른
> 투자자문업 등록 및 유사투자자문업 신고 절차를 완료하지 아니하였으며,
> 법인 설립 절차 또한 진행 중입니다.
>
> 이에 따라 본 페이지에 표시된 명칭·조직·연락처 등 일체의 표기는 서비스
> 개발 및 시험 운영을 위한 임시 표기이며, 실제 사업자 정보가 아닙니다.
>
> 운영 주체는 본 페이지에 게재된 어떠한 내용도 투자자문·투자권유·투자중개
> 또는 이에 준하는 금융서비스의 제공으로 해석될 수 없음을 명확히 하며,
> 본 페이지의 열람 또는 이용으로부터 비롯되는 일체의 판단과 그 결과에
> 대하여 어떠한 법적 책임도 부담하지 않습니다.
>
> 정식 서비스 개시 시점은 관련 인허가 및 법인 설립 절차의 완료 후 별도로
> 공지합니다.
>
> 한편, 본 사이트의 커뮤니티 서비스는 이용자 간 정보 교환을 목적으로 하는
> 별개의 서비스로서 정상적으로 운영되고 있습니다.

> **마지막 문단은 자문사 사이트로 옮길 때 고쳐야 한다.** 사이트가 분리되면
> "본 사이트의 커뮤니티 서비스" 라는 표현이 맞지 않는다. 커뮤니티를
> 가리키려면 사이트 이름과 주소를 명시하는 쪽으로 바꾼다.

---

## 5. 사업자 정보 표기 규칙 (같이 쓰면 좋은 것)

커뮤니티 쪽 `src/config/company.ts` 에 있는 규칙인데, 자문사 사이트에서도
같은 원칙이 필요하다.

| | |
|---|---|
| 미확정 값 | **반드시 `null`.** 형식만 맞춘 더미 사업자등록번호·주소·전화번호를 넣지 않는다 — 더미 값도 허위 표기로 읽힌다 |
| 화면 표기 | `null` 이면 `설립 절차 진행 중`, 자문업 미신고면 `해당 없음 (미신고)` |
| 단일 출처 | 사업자 정보는 설정 파일 한 곳에만 둔다. 설립·신고 완료 시 그 파일만 고친다 |

---

## 6. 이 파일을 지워도 되는 때

자문사 사이트 저장소가 생기고 위 내용이 그쪽으로 옮겨진 뒤. 그전까지는
남겨 둔다 — 원본은 git 이력에 있지만(`git show <제거 커밋>`), 이력을 뒤져야
찾을 수 있는 것은 사실상 없는 것과 같다.
