import { getPublicAuthSettings } from "@/lib/supabase/auth-settings";

/**
 * 이메일 인증이 꺼져 있으면 상단에 띄우는 경고.
 *
 * 개발 중에는 인증을 끄는 편이 편하지만, 그 상태로 오픈하면 남의 이메일
 * 주소로도 무제한 가입이 가능하다. 문서에 적어두는 것만으로는 잊기 쉬워서
 * 화면에 남긴다.
 *
 * 대시보드에서 Confirm email 을 다시 켜면 자동으로 사라진다
 * (RELEASE_CHECKLIST.md 참고). 배너를 지우려고 코드를 고칠 필요가 없다 —
 * 코드를 고쳐서 지우면 정작 필요한 순간에 경고가 없어진다.
 */
export async function DevAuthBanner() {
  const settings = await getPublicAuthSettings();
  if (!settings?.mailerAutoconfirm) return null;

  return (
    <div
      role="status"
      className="border-b border-warn bg-warn-soft px-4 py-2.5 text-center text-fine text-warn-ink lg:px-6"
    >
      <b className="font-bold">개발 모드</b> 이메일 인증 없이 가입됩니다.
      정식 오픈 전에 Supabase 에서 <b className="font-bold">Confirm email</b> 을
      다시 켜야 합니다.
    </div>
  );
}
