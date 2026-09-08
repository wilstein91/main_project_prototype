import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { PendingNotice } from "@/components/ui/PendingNotice";
import { getCategories } from "@/lib/data/queries";

export const metadata = { title: "글쓰기" };

/**
 * 글 작성 (F-205) — 마크다운 본문.
 * 인증 연결(T-11) 후에는 미인증 접근 시 proxy.ts 에서
 * /login?redirect=/write 로 보낸다.
 */
export default async function WritePage({ searchParams }: PageProps<"/write">) {
  const { category } = await searchParams;
  const categories = await getCategories();
  const writable = categories.filter((c) => c.write_role === "user");
  const preset = typeof category === "string" ? category : writable[0]?.slug;

  return (
    <div className="px-4 py-5 lg:px-0 lg:py-0">
      <h1 className="mb-4 text-title font-bold text-ink">글쓰기</h1>
      <PendingNotice ticket="T-14" />

      <form className="flex flex-col gap-5">
        <Field label="카테고리" required>
          <Select name="category" defaultValue={preset} disabled>
            {writable.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="제목" required hint="최대 100자">
          <Input
            name="title"
            maxLength={100}
            placeholder="제목을 입력하세요"
            disabled
          />
        </Field>

        <Field
          label="본문"
          required
          hint="마크다운을 사용할 수 있습니다. 최대 20,000자"
        >
          <Textarea
            name="content"
            rows={16}
            maxLength={20000}
            placeholder="내용을 입력하세요"
            disabled
          />
        </Field>

        <div className="rounded-[var(--radius-sm)] bg-surface px-4 py-3 text-[12px] leading-relaxed text-ink-sub">
          시세조종·허위사실, 대가를 받은 종목 권유, 원금·수익률 보장 취지의
          게시물은 사전 통지 없이 삭제될 수 있습니다.
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" disabled>
            취소
          </Button>
          <Button type="submit" disabled>
            등록
          </Button>
        </div>
      </form>
    </div>
  );
}
