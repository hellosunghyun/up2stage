import { describe, it, expect, beforeEach } from "vitest";
import {
  discoverAttachments,
  SUPPORTED_EXTENSIONS,
} from "../../../src/features/discovery/discover";
import { inferExtension, inferFileName } from "../../../src/features/discovery/filename";
import { canonicalUrl, toAbsoluteUrl } from "../../../src/features/discovery/url";

describe("attachment discovery", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("finds anchor links with supported extensions", () => {
    document.body.innerHTML =
      '<a href="https://example.org/notice.pdf">공고문</a>';
    const found = discoverAttachments("https://example.org/");
    expect(found).toHaveLength(1);
    expect(found[0]?.fileName).toBe("notice.pdf");
    expect(found[0]?.extension).toBe("pdf");
    expect(found[0]?.selected).toBe(true);
  });

  it("converts relative URLs to absolute", () => {
    document.body.innerHTML = '<a href="/documents/form.hwp">신청서</a>';
    const found = discoverAttachments("https://example.org/page");
    expect(found[0]?.url).toBe("https://example.org/documents/form.hwp");
  });

  it("deduplicates same URL and filename", () => {
    document.body.innerHTML = `
      <a href="https://example.org/a.pdf">A</a>
      <a href="https://example.org/a.pdf">A again</a>
    `;
    const found = discoverAttachments("https://example.org/");
    expect(found).toHaveLength(1);
  });

  it("filters unsupported extensions", () => {
    document.body.innerHTML = `
      <a href="https://example.org/a.pdf">pdf</a>
      <a href="https://example.org/b.exe">exe</a>
      <a href="https://example.org/c.zip">zip</a>
    `;
    const found = discoverAttachments("https://example.org/");
    expect(found.map((d) => d.fileName)).toEqual(["a.pdf"]);
  });

  it("returns empty for no supported documents", () => {
    document.body.innerHTML =
      '<a href="https://example.org/page.html">link</a>';
    const found = discoverAttachments("https://example.org/");
    expect(found).toHaveLength(0);
  });

  it("finds multiple supported documents", () => {
    document.body.innerHTML = `
      <a href="https://example.org/notice.pdf">공고</a>
      <a href="https://example.org/form.hwp">신청</a>
      <a href="https://example.org/list.xlsx">목록</a>
    `;
    const found = discoverAttachments("https://example.org/");
    expect(found).toHaveLength(3);
  });

  it("extracts source element text", () => {
    document.body.innerHTML =
      '<a href="https://example.org/notice.pdf">공고문 다운로드</a>';
    const found = discoverAttachments("https://example.org/");
    expect(found[0]?.sourceElementText).toBe("공고문 다운로드");
  });
});

describe("filename inference", () => {
  it("infers filename from URL", () => {
    expect(inferFileName("https://example.org/path/notice.pdf")).toBe(
      "notice.pdf"
    );
  });

  it("decodes percent-encoded filename", () => {
    expect(
      inferFileName("https://example.org/%EA%B3%B5%EA%B3%A0%EB%AC%B8.pdf")
    ).toBe("공고문.pdf");
  });

  it("infers extension", () => {
    expect(inferExtension("notice.PDF")).toBe("pdf");
  });

  it("returns undefined for no extension", () => {
    expect(inferExtension("notice")).toBeUndefined();
  });
});

describe("URL resolution", () => {
  it("resolves relative to absolute", () => {
    expect(toAbsoluteUrl("/docs/a.pdf", "https://example.org/page")).toBe(
      "https://example.org/docs/a.pdf"
    );
  });

  it("canonicalizes by removing hash", () => {
    expect(canonicalUrl("https://example.org/a.pdf#section")).toBe(
      "https://example.org/a.pdf"
    );
  });
});

it("exports supported extensions list", () => {
  expect(SUPPORTED_EXTENSIONS).toEqual(["pdf", "hwp", "hwpx", "xlsx", "docx", "pptx"]);
});
