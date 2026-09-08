import { redirect } from "next/navigation";
import {
  NicknameForm,
  PasswordForm,
  WithdrawForm,
} from "@/components/settings/SettingsForms";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { PendingNotice } from "@/components/ui/PendingNotice";
import { signOutAction } from "@/lib/actions/auth";
import { formatKstDate, nicknameChangeAvailableAt } from "@/lib/profile-rules";
import { isSeedMode } from "@/lib/data/queries";
import { getViewer } from "@/lib/session";

export const metadata = { title: "내 정보", robots: { index: false } };

/** 프로필 설정 (F-106 / F-107) */
export default async function SettingsPage() {
  const viewer = await getViewer();

  // 시드 모드에서는 세션이 없다. 형상 확인을 막지 않도록
  // 비활성 상태의 화면을 그대로 보여준다.
  if (!viewer && !isSeedMode()) redirect("/login?redirect=/settings");

  const blocked = viewer
    ? nicknameChangeAvailableAt(viewer.nickname_changed_at)
    : null;
  const blockedUntil = blocked ? formatKstDate(blocked) : null;

  return (
    <div className="px-4 py-5 lg:px-0 lg:py-0">
      <h1 className="mb-4 text-title font-bold text-ink">내 정보</h1>

      {!viewer ? (
        <>
          <PendingNotice ticket="Supabase 연결" />
          <DisabledPreview />
        </>
      ) : (
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <h2 className="text-list font-bold text-ink">닉네임</h2>
            <NicknameForm
              current={viewer.nickname}
              blockedUntil={blockedUntil}
            />
          </section>

          <section className="flex flex-col gap-4 border-t border-line pt-8">
            <h2 className="text-list font-bold text-ink">비밀번호</h2>
            <PasswordForm />
          </section>

          <section className="flex flex-col items-start gap-3 border-t border-line pt-8">
            <h2 className="text-list font-bold text-ink">계정</h2>
            <p className="text-meta leading-relaxed text-ink-sub">
              탈퇴 시 계정은 비활성화되고, 작성한 글은 &lsquo;탈퇴한
              사용자&rsquo;로 표기됩니다. 글 삭제를 원하시면 탈퇴 전에 직접
              삭제해 주세요.
            </p>
            <form action={signOutAction}>
              <Button type="submit" variant="secondary" size="sm">
                로그아웃
              </Button>
            </form>
            <div className="border-t border-line pt-4">
              <WithdrawForm />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

/** 시드 모드용 비활성 화면 */
function DisabledPreview() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-list font-bold text-ink">닉네임</h2>
        <Field label="닉네임" hint="2~12자, 한글·영문·숫자. 30일에 한 번 변경">
          <Input disabled />
        </Field>
      </section>
      <section className="flex flex-col gap-4 border-t border-line pt-8">
        <h2 className="text-list font-bold text-ink">비밀번호</h2>
        <Field label="새 비밀번호" hint="10자 이상">
          <Input type="password" disabled />
        </Field>
      </section>
      <section className="flex flex-col items-start gap-3 border-t border-line pt-8">
        <h2 className="text-list font-bold text-ink">계정</h2>
        <ButtonLink href="/login" variant="secondary" size="sm">
          로그인
        </ButtonLink>
      </section>
    </div>
  );
}
