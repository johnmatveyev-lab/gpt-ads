export type UserRole = "owner" | "sales_rep" | "customer";

type RoleEnv = {
  OWNER_EMAILS?: string;
  SALES_REP_EMAILS?: string;
  ownerEmails?: string;
  salesRepEmails?: string;
};

export function resolveUserRole(email: string | null | undefined, env: RoleEnv = process.env as RoleEnv): UserRole {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return "customer";

  if (parseEmailList(env.ownerEmails || env.OWNER_EMAILS).has(normalizedEmail)) return "owner";
  if (parseEmailList(env.salesRepEmails || env.SALES_REP_EMAILS).has(normalizedEmail)) return "sales_rep";

  return "customer";
}

function parseEmailList(value: string | undefined) {
  return new Set(
    (value || "")
      .split(",")
      .map((email) => normalizeEmail(email))
      .filter(Boolean),
  );
}

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() || "";
}
