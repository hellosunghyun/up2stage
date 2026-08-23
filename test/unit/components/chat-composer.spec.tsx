import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ChatComposer } from "../../../src/components/PanelShell";

afterEach(cleanup);

describe("ChatComposer", () => {
  it("reuses the composer as a controlled question form", () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(
      <ChatComposer
        value="마감은 언제인가요?"
        onChange={onChange}
        onSubmit={onSubmit}
      />
    );
    fireEvent.change(screen.getByLabelText("궁금한 것을 물어보세요"), {
      target: { value: "주의사항은?" }
    });
    fireEvent.click(screen.getByRole("button", { name: "질문 보내기" }));
    expect(onChange).toHaveBeenCalledWith("주의사항은?");
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("keeps the legacy no-props composer disabled", () => {
    render(<ChatComposer />);
    expect(screen.getByRole("button", { name: "질문 보내기" }).hasAttribute("disabled")).toBe(true);
  });
});
