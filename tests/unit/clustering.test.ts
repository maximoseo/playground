import { describe, expect, it } from "vitest";
import { assignCluster } from "@/lib/clustering";

describe("clustering", () => {
  it("detects questions", () => {
    expect(assignCluster("how to do keyword research")).toBe("Question-based");
  });

  it("detects local intent", () => {
    expect(assignCluster("seo agency near me")).toBe("Local intent");
  });
});
