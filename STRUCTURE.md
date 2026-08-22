# Repository Structure

```text
up2stage-codebase-starter/
├── .cursor
│   └── rules
│       └── 00-read-agents.mdc
├── .github
│   ├── copilot-instructions.md
│   └── PULL_REQUEST_TEMPLATE.md
├── docs
│   ├── 01-product
│   │   ├── acceptance-criteria.md
│   │   ├── AGENTS.md
│   │   ├── feature-inventory.md
│   │   ├── product-overview.md
│   │   └── user-flow.md
│   ├── 02-architecture
│   │   ├── agent-integration.md
│   │   ├── AGENTS.md
│   │   ├── extension-entrypoints.md
│   │   ├── search-solar.md
│   │   ├── storage-cache.md
│   │   ├── system-overview.md
│   │   └── viewer-renderers.md
│   ├── 03-data-contracts
│   │   ├── agent-output-contract.md
│   │   ├── AGENTS.md
│   │   ├── canonical-models.md
│   │   ├── quick-question-decision.md
│   │   ├── source-evidence-model.md
│   │   └── storage-schema.md
│   ├── 04-design
│   │   ├── accessibility-view.md
│   │   ├── AGENTS.md
│   │   ├── contextual-overlay.md
│   │   ├── design-tokens.md
│   │   ├── dynamic-quick-question.md
│   │   ├── figma-reference.md
│   │   ├── side-panel.md
│   │   ├── ui-output-coverage.md
│   │   └── viewer-layout.md
│   ├── 05-engineering
│   │   ├── agent-usage.md
│   │   ├── AGENTS.md
│   │   ├── dependency-catalog.md
│   │   ├── error-retry-resume.md
│   │   ├── git-workflow.md
│   │   ├── logging-performance.md
│   │   └── naming-conventions.md
│   ├── 06-security
│   │   ├── AGENTS.md
│   │   ├── api-key-and-data-handling.md
│   │   ├── chrome-permissions.md
│   │   └── privacy-security.md
│   ├── 07-testing
│   │   ├── accessibility-qa.md
│   │   ├── AGENTS.md
│   │   ├── demo-smoke-test.md
│   │   ├── fixtures.md
│   │   └── test-strategy.md
│   ├── 08-roadmap
│   │   ├── AGENTS.md
│   │   ├── commit-plan.md
│   │   ├── implementation-phases.md
│   │   └── p0-cut-line.md
│   ├── 09-decisions
│   │   ├── 0000-template.md
│   │   ├── 0001-no-backend-p0.md
│   │   ├── 0002-wxt-react.md
│   │   ├── 0003-agent-v022-freeze.md
│   │   ├── 0004-source-registry.md
│   │   ├── 0005-renderer-adapters.md
│   │   ├── 0006-dexie-zustand.md
│   │   ├── 0007-search-is-not-evidence.md
│   │   ├── 0008-instruct-and-solar.md
│   │   ├── 0009-branding.md
│   │   └── AGENTS.md
│   ├── 00-glossary.md
│   ├── 00-index.md
│   ├── 00-source-of-truth.md
│   └── AGENTS.md
├── entrypoints
│   ├── background
│   │   ├── AGENTS.md
│   │   └── README.md
│   ├── content
│   │   ├── AGENTS.md
│   │   └── README.md
│   ├── options
│   │   ├── AGENTS.md
│   │   └── README.md
│   ├── sidepanel
│   │   ├── AGENTS.md
│   │   └── README.md
│   ├── viewer
│   │   ├── AGENTS.md
│   │   └── README.md
│   └── AGENTS.md
├── public
│   ├── icons
│   │   ├── AGENTS.md
│   │   └── README.md
│   └── AGENTS.md
├── references
│   ├── design
│   │   ├── AGENTS.md
│   │   ├── figma-reference.md
│   │   ├── mockup-side-panel.png
│   │   ├── presentation-notes.md
│   │   ├── presentation-with-notes.pptx
│   │   └── README.md
│   ├── research
│   │   ├── accessible-document-view.md
│   │   ├── AGENTS.md
│   │   ├── chrome-extension-security-policy.md
│   │   ├── chrome-extension-technical-feasibility.md
│   │   ├── document-ai-benchmark.md
│   │   ├── README.md
│   │   ├── universal-accessible-viewer-design.md
│   │   └── upstage-technical-feasibility.md
│   ├── source-specs
│   │   ├── 01-master-report.md
│   │   ├── 02-technical-spec.md
│   │   ├── 03-development-implementation-spec.md
│   │   └── AGENTS.md
│   ├── upstage
│   │   ├── agent
│   │   │   ├── history
│   │   │   │   └── UP2STAGE_Document_Intelligence_v0.21.json
│   │   │   ├── AGENTS.md
│   │   │   ├── README.md
│   │   │   └── UP2STAGE_General_Document_Guidance_v0.22.json
│   │   ├── manuals
│   │   │   ├── agents.md
│   │   │   ├── AGENTS.md
│   │   │   ├── capabilities.md
│   │   │   ├── README.md
│   │   │   └── studio.md
│   │   ├── runs
│   │   │   ├── final
│   │   │   │   ├── job_XHVD4hULc9tFatRSVr7Bgx.json
│   │   │   │   └── README.md
│   │   │   ├── history
│   │   │   │   ├── job_RQsD5EE8MMnxJKPkXKhf9m.json
│   │   │   │   ├── job_TnsrH7wqtgdBCrQKbUnmQ6.json
│   │   │   │   └── README.md
│   │   │   └── AGENTS.md
│   │   ├── track
│   │   │   ├── AGENTS.md
│   │   │   ├── upstage-track-brief.pdf
│   │   │   └── upstage-track-session-transcript.json
│   │   ├── AGENTS.md
│   │   └── README.md
│   ├── AGENTS.md
│   ├── CHECKSUMS.sha256
│   └── README.md
├── src
│   ├── components
│   │   ├── AGENTS.md
│   │   └── README.md
│   ├── core
│   │   ├── agent
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   ├── decision
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   ├── evidence
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   ├── messaging
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   ├── search
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   ├── solar
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   ├── storage
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   └── AGENTS.md
│   ├── features
│   │   ├── accessibility
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   ├── contextual-overlay
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   ├── discovery
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   ├── document-selection
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   ├── guidance
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   ├── processing
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   ├── qa
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   ├── quick-check
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   ├── source-navigation
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   └── AGENTS.md
│   ├── models
│   │   ├── AGENTS.md
│   │   └── README.md
│   ├── renderers
│   │   ├── hwp
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   ├── pdf
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   ├── semantic
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   ├── xlsx
│   │   │   ├── AGENTS.md
│   │   │   └── README.md
│   │   └── AGENTS.md
│   ├── styles
│   │   ├── AGENTS.md
│   │   └── README.md
│   ├── utils
│   │   ├── AGENTS.md
│   │   └── README.md
│   └── AGENTS.md
├── test
│   ├── e2e
│   │   ├── AGENTS.md
│   │   └── README.md
│   ├── fixtures
│   │   ├── AGENTS.md
│   │   └── README.md
│   ├── integration
│   │   ├── AGENTS.md
│   │   └── README.md
│   ├── unit
│   │   ├── AGENTS.md
│   │   └── README.md
│   └── AGENTS.md
├── .editorconfig
├── .env.example
├── .gitignore
├── .gitmessage
├── .npmrc
├── AGENTS.md
├── CHANGELOG.md
├── CLAUDE.md
├── commitlint.config.mjs
├── CONTRIBUTING.md
├── eslint.config.mjs
├── FILES.md
├── package.json
├── prettier.config.mjs
├── README.md
├── SECURITY.md
├── STRUCTURE.md
├── tsconfig.json
└── wxt.config.ts
```
