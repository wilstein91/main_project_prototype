import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { PendingNotice } from "@/components/ui/PendingNotice";

export const metadata = { title: "내 정보" };

/** 프로필 설정 (F-106) */
export default function SettingsPage() {
  return (
    <div className="px-4 py-5 lg:px-0 lg:py-0">
      <h1 className="mb-4 text-title font-bold text-ink">내 정보</h1>
      <PendingNotice ticket="T-18" />

      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <h2 className="text-list font-bold text-ink">닉네임</h2>
          <Field
            label="닉네임"
            hint="2~12자, 한글·영문·숫자. 30일에 한 번 변경할 수 있습니다."
          >
            <Input name="nickname" maxLength={12} disabled />
          </Field>
          <div>
            <Button size="sm" disabled>
              변경
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-line pt-8">
          <h2 className="text-list font-bold text-ink">비밀번호</h2>
          <Field label="현재 비밀번호">
            <Input type="password" autoComplete="current-password" disabled />
          </Field>
          <Field
            label="새 비밀번호"
            hint="10자 이상, 영문·숫자·특수문자 중 2종 이상"
          >
            <Input type="password" autoComplete="new-password" disabled />
          </Field>
          <div>
            <Button size="sm" disabled>
              변경
            </Button>
          </div>
        </section>

        <section className="flex flex-col items-start gap-3 border-t border-line pt-8">
          <h2 className="text-list font-bold text-ink">계정</h2>
          <p className="text-meta text-ink-sub">
            탈퇴 시 계정은 비활성화되고, 작성한 글은 &lsquo;탈퇴한
            사용자&rsquo;로 표기됩니다.
          </p>
          <div className="flex gap-2">
            <ButtonLink href="/login" variant="secondary" size="sm">
              로그아웃
            </ButtonLink>
            <Button variant="danger" size="sm" disabled>
              회원 탈퇴
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
