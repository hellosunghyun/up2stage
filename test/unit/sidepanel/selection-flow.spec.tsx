import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  ApiKeySetup,
  ConsentView,
  DiscoveryView,
  SelectionView
} from "../../../entrypoints/sidepanel/App";
import type { AttachmentPayload } from "../../../src/core/messaging/protocol";

afterEach(cleanup);

const attachments: AttachmentPayload[] = [
  {
    id: "doc-1",
    url: "https://example.com/notice.hwp",
    fileName: "공고문.hwp",
    extension: "hwp",
    selected: true,
    accessible: true
  },
  {
    id: "doc-2",
    url: "https://example.com/checklist.xlsx",
    fileName: "신청 가능 대학 목록.xlsx",
    extension: "xlsx",
    selected: false,
    accessible: true
  }
];

describe("side panel discovery and selection flow", () => {
  it("enables the Upstage connection only after a key is entered", () => {
    const onSubmit = vi.fn();
    const onHelp = vi.fn();
    const { rerender } = render(
      <ApiKeySetup value="" onChange={() => {}} onSubmit={onSubmit} onHelp={onHelp} />
    );
    expect(screen.getByRole("button", { name: "연결하기" }).hasAttribute("disabled")).toBe(true);

    rerender(
      <ApiKeySetup value="up_test" onChange={() => {}} onSubmit={onSubmit} onHelp={onHelp} />
    );
    fireEvent.click(screen.getByRole("button", { name: "연결하기" }));
    fireEvent.click(screen.getByRole("button", { name: /API Key는 어디서 찾나요/ }));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onHelp).toHaveBeenCalledOnce();
  });

  it("starts document selection from the primary discovery action", () => {
    const onStart = vi.fn();
    render(<DiscoveryView attachments={attachments} onStart={onStart} />);

    expect(screen.getByText("2개 문서를 찾았어요")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /이 페이지의 문서찾기/ }));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("reflects selected documents and toggles a row", () => {
    const onToggle = vi.fn();
    render(
      <SelectionView
        attachments={attachments}
        selectedIds={new Set(["doc-1"])}
        onToggle={onToggle}
        onSelectAll={() => {}}
        onNext={() => {}}
        onBack={() => {}}
      />
    );

    const selected = screen.getByRole("button", { name: /공고문.hwp/ });
    expect(selected.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(selected);
    expect(onToggle).toHaveBeenCalledWith("doc-1");
  });

  it("keeps analysis disabled until document consent is valid", () => {
    const { rerender } = render(
      <ConsentView
        selectedDocs={attachments}
        canStart={false}
        consentChecked={false}
        onToggleConsent={() => {}}
        onStart={() => {}}
        onBack={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: "분석 시작" }).hasAttribute("disabled")).toBe(true);

    rerender(
      <ConsentView
        selectedDocs={attachments}
        canStart
        consentChecked
        onToggleConsent={() => {}}
        onStart={() => {}}
        onBack={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: "분석 시작" }).hasAttribute("disabled")).toBe(false);
  });
});
