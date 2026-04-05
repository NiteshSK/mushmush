/**
 * Unit tests for email routing helpers
 */

// We need to test the routing functions in isolation
// Mock the env vars before importing
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

describe("Email Routing Helpers", () => {
  describe("getAdminEmails", () => {
    it("returns empty array when ADMIN_EMAIL is not set", async () => {
      delete process.env.ADMIN_EMAIL;
      const { getAdminEmails } = await import("../email");
      expect(getAdminEmails()).toEqual([]);
    });

    it("returns single email when one is set", async () => {
      process.env.ADMIN_EMAIL = "admin@test.com";
      const { getAdminEmails } = await import("../email");
      expect(getAdminEmails()).toEqual(["admin@test.com"]);
    });

    it("returns multiple emails from comma-separated value", async () => {
      process.env.ADMIN_EMAIL = "admin1@test.com,admin2@test.com";
      const { getAdminEmails } = await import("../email");
      expect(getAdminEmails()).toEqual(["admin1@test.com", "admin2@test.com"]);
    });

    it("trims whitespace from emails", async () => {
      process.env.ADMIN_EMAIL = " admin@test.com , admin2@test.com ";
      const { getAdminEmails } = await import("../email");
      expect(getAdminEmails()).toEqual(["admin@test.com", "admin2@test.com"]);
    });
  });

  describe("getOrderEmails", () => {
    it("includes admin emails plus ORDERS_EMAIL", async () => {
      process.env.ADMIN_EMAIL = "admin@test.com";
      process.env.ORDERS_EMAIL = "orders@test.com";
      const { getOrderEmails } = await import("../email");
      const result = getOrderEmails();
      expect(result).toContain("admin@test.com");
      expect(result).toContain("orders@test.com");
    });

    it("deduplicates emails", async () => {
      process.env.ADMIN_EMAIL = "orders@test.com";
      process.env.ORDERS_EMAIL = "orders@test.com";
      const { getOrderEmails } = await import("../email");
      const result = getOrderEmails();
      expect(result).toEqual(["orders@test.com"]);
    });

    it("works without ORDERS_EMAIL set", async () => {
      process.env.ADMIN_EMAIL = "admin@test.com";
      delete process.env.ORDERS_EMAIL;
      const { getOrderEmails } = await import("../email");
      expect(getOrderEmails()).toEqual(["admin@test.com"]);
    });
  });

  describe("getConciergeEmails", () => {
    it("includes admin emails plus CONCIERGE_EMAIL", async () => {
      process.env.ADMIN_EMAIL = "admin@test.com";
      process.env.CONCIERGE_EMAIL = "concierge@test.com";
      const { getConciergeEmails } = await import("../email");
      const result = getConciergeEmails();
      expect(result).toContain("admin@test.com");
      expect(result).toContain("concierge@test.com");
    });

    it("works without CONCIERGE_EMAIL set", async () => {
      process.env.ADMIN_EMAIL = "admin@test.com";
      delete process.env.CONCIERGE_EMAIL;
      const { getConciergeEmails } = await import("../email");
      expect(getConciergeEmails()).toEqual(["admin@test.com"]);
    });
  });
});
