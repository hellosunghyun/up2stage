import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(here, "../../..");
const sourcePath = path.join(
  repositoryRoot,
  "references/upstage/runs/final/job_XHVD4hULc9tFatRSVr7Bgx.json"
);
const outputPath = path.join(here, "job_XHVD4hULc9tFatRSVr7Bgx.sample.json");
const includedPages = new Set([1, 2, 3, 4, 5, 6, 15, 17, 18, 19]);

function minimalParseHtml(html) {
  const footer = /<footer\b[^>]*>[\s\S]*?-\s*(\d+)\s*-[\s\S]*?<\/footer>/gi;
  const pages = new Map();
  let cursor = 0;
  let match;

  while ((match = footer.exec(html)) !== null) {
    const page = Number(match[1]);
    pages.set(page, html.slice(cursor, match.index));
    cursor = match.index + match[0].length;
  }
  const lastMarkedPage = Math.max(0, ...pages.keys());
  const tail = html.slice(cursor);
  const applicationStart = tail.indexOf("2026년 하반기 서울인재대학장학금 자기소개서");
  const referenceStart = tail.indexOf("2026년도 서울인재대학장학금 신청 가능 대학 안내");
  const checklistStart = tail.indexOf("2026년 하반기 서울인재대학장학금 자가 체크리스트");
  const procedureStart = tail.indexOf("2026년 서울인재대학장학금 신청방법 안내");
  const compactTail = [
    tail.slice(Math.max(0, applicationStart - 80), referenceStart),
    tail.slice(Math.max(0, referenceStart - 80), referenceStart + 12000),
    tail.slice(Math.max(0, checklistStart - 80), procedureStart),
    tail.slice(Math.max(0, procedureStart - 80), procedureStart + 60000),
  ].join("\n");
  pages.set(lastMarkedPage + 1, compactTail);
  const lastPage = Math.max(24, ...pages.keys());

  return Array.from({ length: lastPage }, (_, index) => {
    const page = index + 1;
    const content = includedPages.has(page) ? (pages.get(page) ?? "") : "";
    return `${content}<footer>- ${page} -</footer>`;
  }).join("\n");
}

const raw = JSON.parse(await readFile(sourcePath, "utf8"));
const fixture = {
  ...raw,
  id: `${raw.id}_sample`,
  output: raw.output.map((item) => {
    if (item.model !== "step_1_parse") return item;
    return {
      ...item,
      content: item.content.map((content) => {
        const parsed = JSON.parse(content.text);
        return {
          ...content,
          text: JSON.stringify({
            api: parsed.api,
            content: { html: minimalParseHtml(parsed.content.html) },
          }),
        };
      }),
    };
  }),
};

await writeFile(outputPath, `${JSON.stringify(fixture, null, 2)}\n`);
