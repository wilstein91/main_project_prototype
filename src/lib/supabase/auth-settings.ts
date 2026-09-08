import { isSupabaseConfigured, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";

/**
 * Supabase 인증 설정 중 공개된 값을 읽는다.
 *
 * 목적은 하나다 — **이메일 인증이 꺼진 상태를 앱이 스스로 알아채기.**
 * 개발 편의로 끄는 것은 괜찮지만, 그대로 오픈하면 남의 이메일로 무제한
 * 가입이 가능해진다. 체크리스트에 적어두는 것만으로는 잊기 쉬우므로
 * 화면에 배너를 띄운다 (DevAuthBanner).
 *
 * 대시보드에서 Confirm email 을 다시 켜면 이 값이 바뀌어 배너가
 * 자동으로 사라진다. 코드를 고칠 필요가 없다.
 */
export interface PublicAuthSettings {
  /** true = 이메일 인증 없이 즉시 가입 (개발용 상태) */
  mailerAutoconfirm: boolean;
  /** true = 신규 가입 중단 */
  signupDisabled: boolean;
}

export async function getPublicAuthSettings(): Promise<PublicAuthSettings | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
      // 매 요청마다 부를 필요가 없다. 5분 캐시.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      mailer_autoconfirm?: boolean;
      disable_signup?: boolean;
    };
    return {
      mailerAutoconfirm: json.mailer_autoconfirm === true,
      signupDisabled: json.disable_signup === true,
    };
  } catch {
    // 설정을 못 읽는다고 화면이 깨지면 안 된다. 배너만 생략한다.
    return null;
  }
}
