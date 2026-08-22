export interface ContextRule {
  id: string;
  match(url: URL): boolean;
  label?: string;
  attachmentSelectors?: string[];
}

export const defaultContextRules: ContextRule[] = [
  {
    id: "demo-scholarship",
    label: "장학 공고",
    match: (url) =>
      url.hostname === "example.org" &&
      url.pathname.startsWith("/scholarship/"),
  },
];

export function findMatchingRule(
  url: URL,
  rules: ContextRule[] = defaultContextRules
): ContextRule | undefined {
  return rules.find((rule) => rule.match(url));
}
