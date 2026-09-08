import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PostBody } from "./PostBody";

/**
 * 사용자 본문 sanitize 검증 (TECH_SPEC §9.1).
 *
 * 실제 컴포넌트를 서버 렌더링해서 결과 HTML 을 검사한다. DOM 이 필요 없고,
 * 프로덕션에서 나가는 것과 같은 파이프라인을 지난다.
 *
 * 이 테스트가 깨지면 XSS 가 열린 것이다. 기대값을 완화하지 말고 원인을 고칠 것.
 */
const render = (md: string) => renderToStaticMarkup(<PostBody content={md} />);

describe("위험한 입력을 제거한다", () => {
  /**
   * 원시 HTML 은 rehype-raw 를 쓰지 않으므로 파싱조차 되지 않고,
   * 그 줄이 통째로 사라진다. 사용자가 HTML 을 쓰면 조용히 없어지는
   * 셈이라 UX 로는 아쉽지만, 공격면이 가장 작은 선택이다.
   * (문서: TECH_SPEC §9.1)
   */
  it("script 태그를 제거한다", () => {
    const html = render("<script>window.x=1</script>");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("window.x");
  });

  it("원시 HTML 이 있어도 다른 단락의 정상 텍스트는 살아남는다", () => {
    const html = render(`<script>window.x=1</script>

정상 텍스트`);
    expect(html).not.toContain("window.x");
    expect(html).toContain("정상 텍스트");
  });

  it("이벤트 핸들러가 달린 img 를 제거한다", () => {
    const html = render('<img src=x onerror="window.x=1">');
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("<img");
  });

  it("iframe 을 제거한다", () => {
    expect(render('<iframe src="https://example.com"></iframe>')).not.toContain("<iframe");
  });

  it("style 속성과 div 를 제거한다", () => {
    const html = render('<div style="position:fixed;inset:0">덮기</div>');
    expect(html).not.toContain("style=");
    expect(html).not.toContain("<div style");
  });

  it("javascript: 링크를 남기지 않는다", () => {
    const html = render('[위험](javascript:alert(1))');
    expect(html).not.toContain("javascript:");
  });

  it("data: 스킴 링크를 남기지 않는다", () => {
    const html = render('[위험](data:text/html;base64,PHNjcmlwdD4=)');
    expect(html).not.toContain("data:text/html");
  });
});

describe("정상 마크다운은 렌더한다", () => {
  it("제목·강조·목록·인용을 살린다", () => {
    const html = render(`## 제목

**굵게** *기울임*

- 하나
- 둘

> 인용`);
    expect(html).toContain("<h2");
    expect(html).toContain("<strong>굵게</strong>");
    expect(html).toContain("<em>");
    expect(html).toContain("<li>");
    expect(html).toContain("<blockquote>");
  });

  it("표(GFM)를 렌더한다", () => {
    const html = render(`| 항목 | 값 |
|---|---|
| A | 1 |`);
    expect(html).toContain("<table>");
    expect(html).toContain("<th");
    expect(html).toContain("<td");
  });

  it("코드블록을 렌더한다", () => {
    const html = render("```\nconst a = 1;\n```");
    expect(html).toContain("<pre>");
    expect(html).toContain("<code");
  });
});

describe("외부 링크 처리", () => {
  it("http 링크에 nofollow noopener noreferrer 를 강제한다", () => {
    const html = render("[정상](https://example.com)");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="nofollow noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  it("mailto 링크는 허용한다", () => {
    expect(render("[메일](mailto:a@b.com)")).toContain("mailto:a@b.com");
  });
});
