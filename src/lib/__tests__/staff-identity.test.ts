import { googleWorkspaceIdentity, matchesWorkspace, needsManagedSignIn } from "../staff-identity";

const account = { provider: "google", providerAccountId: "verified-subject" };
const profile = { sub: "verified-subject", email: "Finance@Example.Test", hd: "example.test", email_verified: true };
const identity = googleWorkspaceIdentity(account, profile);

describe("managed staff identity", () => {
  const prior = process.env.STAFF_AUTH_MODE;
  afterEach(() => { if (prior === undefined) delete process.env.STAFF_AUTH_MODE; else process.env.STAFF_AUTH_MODE = prior; });
  it("leaves existing sign-in behavior intact until the deployment enables managed mode", () => {
    delete process.env.STAFF_AUTH_MODE;
    expect(needsManagedSignIn("ADMIN")).toBe(false);
    process.env.STAFF_AUTH_MODE = "managed-google";
    expect(needsManagedSignIn("ADMIN")).toBe(true);
    expect(needsManagedSignIn("STAFF")).toBe(true);
    expect(needsManagedSignIn("CUSTOMER")).toBe(false);
  });
  it("requires a verified matching Google subject and hosted domain", () => {
    expect(matchesWorkspace(identity, "finance@example.test", "EXAMPLE.TEST")).toBe(true);
    expect(googleWorkspaceIdentity({ ...account, provider: "credentials" }, profile)).toBeNull();
    expect(googleWorkspaceIdentity({ ...account, providerAccountId: "other" }, profile)).toBeNull();
    expect(googleWorkspaceIdentity(account, { ...profile, email_verified: false })).toBeNull();
    expect(googleWorkspaceIdentity(account, { ...profile, hd: undefined })).toBeNull();
  });
  it("withholds staff rights for old sessions, missing configuration, changed email or another workspace", () => {
    expect(matchesWorkspace(undefined, profile.email, "example.test")).toBe(false);
    expect(matchesWorkspace(identity, profile.email, "")).toBe(false);
    expect(matchesWorkspace(identity, "other@example.test", "example.test")).toBe(false);
    expect(matchesWorkspace(identity, profile.email, "other.test")).toBe(false);
    expect(matchesWorkspace({ ...identity!, hostedDomain: "example.test.evil.test" }, profile.email, "example.test")).toBe(false);
  });
});
