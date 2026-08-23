import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  ChatComposer,
  CurrentPageCard,
  PanelHeader,
  PanelShell,
} from "../../../src/components/PanelShell";

afterEach(cleanup);

describe("PanelShell", () => {
  it("keeps header, content, and footer in one shell", () => {
    render(
      <PanelShell header={<div>헤더</div>} footer={<div>하단</div>}>
        본문
      </PanelShell>
    );

    expect(screen.getByText("헤더")).toBeTruthy();
    expect(screen.getByText("본문")).toBeTruthy();
    expect(screen.getByText("하단")).toBeTruthy();
  });

  it("exposes refresh and settings actions", () => {
    vi.stubGlobal("chrome", {
      runtime: { getURL: (path: string) => path },
    });
    const onRefresh = vi.fn();
    const onMenu = vi.fn();

    render(
      <PanelHeader loading={false} onRefresh={onRefresh} onMenu={onMenu} />
    );

    fireEvent.click(screen.getByRole("button", { name: "첨부 문서 다시 찾기" }));
    fireEvent.click(screen.getByRole("button", { name: "설정 열기" }));
    expect(onRefresh).toHaveBeenCalledOnce();
    expect(onMenu).toHaveBeenCalledOnce();
  });

  it("shows page context and a disabled chat affordance", () => {
    render(
      <>
        <CurrentPageCard
          page={{ title: "장학금 선발 안내", url: "https://example.com/notice" }}
        />
        <ChatComposer />
      </>
    );

    expect(screen.getByText("장학금 선발 안내")).toBeTruthy();
    expect(screen.getByText("example.com")).toBeTruthy();
    expect(screen.getByLabelText("후속 질문 입력").getAttribute("aria-disabled")).toBe(
      "true"
    );
  });
});
