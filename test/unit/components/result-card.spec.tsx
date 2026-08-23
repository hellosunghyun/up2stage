import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

afterEach(cleanup);
import { ResultCard } from "../../../src/components/ResultCard";

describe("ResultCard", () => {
  it("renders title and body", () => {
    render(<ResultCard title="주요 조건" body="본문" />);
    expect(screen.getByText("주요 조건")).toBeTruthy();
    expect(screen.getByText("본문")).toBeTruthy();
  });

  it("renders source reference buttons", () => {
    const onClick = vi.fn();
    render(
      <ResultCard
        title="주요 조건"
        body="본문"
        sourceIds={["src:doc_1:p2:e10"]}
        onSourceClick={onClick}
      />
    );
    const badge = screen.getByText("src:doc_1:p2:e10");
    expect(badge).toBeTruthy();
    fireEvent.click(badge);
    expect(onClick).toHaveBeenCalledWith("src:doc_1:p2:e10");
  });
});
