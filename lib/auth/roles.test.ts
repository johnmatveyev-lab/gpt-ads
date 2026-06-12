import { describe, expect, it } from "vitest";
import { resolveUserRole } from "@/lib/auth/roles";

describe("resolveUserRole", () => {
  it("assigns owner role to an allowlisted owner email", () => {
    expect(
      resolveUserRole("Owner@Example.com", {
        ownerEmails: "owner@example.com, founder@example.com",
        salesRepEmails: "sales@example.com",
      }),
    ).toBe("owner");
  });

  it("assigns sales_rep role to an allowlisted sales email", () => {
    expect(
      resolveUserRole("sales@example.com", {
        ownerEmails: "owner@example.com",
        salesRepEmails: "sales@example.com, ae@example.com",
      }),
    ).toBe("sales_rep");
  });

  it("defaults every other authenticated user to customer", () => {
    expect(
      resolveUserRole("visitor@example.com", {
        ownerEmails: "owner@example.com",
        salesRepEmails: "sales@example.com",
      }),
    ).toBe("customer");
  });
});
