import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { Options } from "rehype-sanitize";

/**
 * 사용자 본문 렌더링 — TECH_SPEC §9.1
 *
 * 반드시 rehype-sanitize 를 통과시킨다. dangerouslySetInnerHTML 은
 * 쓰지 않는다.
 *
 * 기본 스키마에서 script·iframe·style·on* 이벤트 속성은 이미 제거된다.
 * 여기서는 허용 태그를 우리가 의도한 범위로 좁히고, 링크에
 * nofollow noopener noreferrer 를 강제한다.
 */
const schema: Options = {
  ...defaultSchema,
  tagNames: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr",
    "strong", "em", "del", "code", "pre",
    "blockquote",
    "ul", "ol", "li",
    "a",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: [["href"], ["title"]],
    code: [["className", /^language-/]],
    th: [["align"]],
    td: [["align"]],
  },
  // javascript: 등 위험한 스킴을 막는다
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto"],
  },
};

export function PostBody({ content }: { content: string }) {
  return (
    <div className="post-body text-body leading-[1.75] text-ink">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, schema]]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="text-brand underline underline-offset-2"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
