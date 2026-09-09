import Link from "next/link";
import {
  advisoryRegDisplay,
  COMPANY,
  companyField,
  isPreIncorporation,
} from "@/config/company";
import { FOOTER_NOTICE } from "@/config/legal";

/**
 * 전역 푸터 고지 — PRD F-409 / 부록 A-2
 *
 * 서비스 성격 문단은 커뮤니티 트랙 고지이므로 규제 상태와 무관하게
 * 항상 같은 문구다. 설립·신고 후에는 사업자 정보 항목만 바뀐다.
 *
 * `자문업 등록·신고번호: 해당 없음 (미신고)` 표기를 지우지 말 것.
 * 자문사 트랙을 별도 사이트로 내보낸 뒤에도 이 줄은 남는다 — 자문사에
 * 관한 정보가 아니라 **이 사이트가 자문사가 아니라는 고지**이기 때문이다
 * (PRD C-3 · §3.7).
 */
export function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-surface">
      <div className="mx-auto max-w-[1200px] px-4 py-10 lg:px-6">
        <nav
          aria-label="사이트 정보"
          className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-meta font-semibold"
        >
          <Link href="/about" className="text-ink hover:text-brand">
            서비스 소개
          </Link>
          <Link href="/terms" className="text-ink-sub hover:text-brand">
            이용약관
          </Link>
          <Link href="/privacy" className="text-ink-sub hover:text-brand">
            개인정보처리방침
          </Link>
          <Link href="/disclaimer" className="text-ink hover:text-brand">
            투자 유의사항
          </Link>
          {/*
            * 자문·일임사 사이트로 나가는 유일한 출구. 주소가 설정돼
            * 있을 때만 렌더한다 — 자문업 등록 전에는 링크 자체가 없다
            * (config/company.ts 의 경고 참고).
            */}
          {COMPANY.advisorySiteUrl && (
            <a
              href={COMPANY.advisorySiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-sub hover:text-brand"
            >
              자문 서비스
            </a>
          )}
        </nav>

        <div className="flex flex-col gap-4 text-[12px] leading-[1.7] text-ink-sub">
          <p>
            <b className="font-bold text-ink">서비스 성격</b>{" "}
            {FOOTER_NOTICE.serviceNature}
          </p>
          <p>
            <b className="font-bold text-ink">투자 유의</b>{" "}
            {FOOTER_NOTICE.investmentWarning}
          </p>
        </div>

        <dl className="mt-7 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-ink-sub">
          <Item label="운영 주체" value={COMPANY.operator} />
          <Item label="상호" value={companyField("legalName")} />
          <Item label="대표자" value={companyField("ceo")} />
          <Item label="사업자등록번호" value={companyField("bizRegNo")} />
          <Item label="소재지" value={companyField("address")} />
          <Item label="자문업 등록·신고번호" value={advisoryRegDisplay()} />
          <Item label="문의" value={COMPANY.contactEmail} />
        </dl>

        {isPreIncorporation() && (
          <p className="mt-6 rounded-[var(--radius-sm)] bg-canvas px-4 py-3 text-[12px] leading-relaxed text-ink-sub">
            본 서비스는 시험 운영 중입니다. 법인 설립 및 자문업 신고·등록 절차가
            완료되지 않았으며, 사업자 정보는 절차 완료 후 게재됩니다.
          </p>
        )}

        <p className="mt-6 text-[12px] text-ink-sub">
          © {new Date().getFullYear()} {COMPANY.serviceName}
        </p>
      </div>
    </footer>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <dt className="shrink-0">{label}</dt>
      <dd className="font-medium text-ink/80">{value}</dd>
    </div>
  );
}
