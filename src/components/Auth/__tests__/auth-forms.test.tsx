import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { signIn, useSession } from "next-auth/react";
import Signin from "../Signin";
import Signup from "../Signup";
import ForgotPassword from "../ForgotPassword";
import ResetPassword from "../ResetPassword";
import AuthError from "../AuthError";
import { hardNavigate } from "../useCallbackUrl";

const replace = jest.fn();
const push = jest.fn();
let query = "";
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace, prefetch: jest.fn() }),
  usePathname: () => "/auth/signin",
  useSearchParams: () => new URLSearchParams(query),
}));
jest.mock("../useCallbackUrl", () => ({
  ...jest.requireActual("../useCallbackUrl"),
  hardNavigate: jest.fn(),
}));

const mockSignIn = signIn as jest.Mock;
const mockSession = useSession as jest.Mock;
const mockFetch = global.fetch as jest.Mock;
const respond = (status: number, body: object) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

beforeAll(() => {
  // jsdom has no modal dialogs; the code dialog only needs these to exist.
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) { this.removeAttribute("open"); };
});

beforeEach(() => {
  query = "";
  mockSession.mockReturnValue({ data: null, status: "unauthenticated" });
});

const type = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const hrefOf = (name: RegExp) => screen.getByRole("link", { name }).getAttribute("href");

describe("Sign in", () => {
  it("returns to a safe callbackUrl after a correct password", async () => {
    query = "callbackUrl=%2Fcheckout";
    mockSignIn.mockResolvedValue({ ok: true, error: null, status: 200, url: "http://localhost/checkout" });
    render(<Signin />);
    type(/^email$/i, "  shopper-a@example.test ");
    type(/^password$/i, "Pantry-test-2026");
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(hardNavigate).toHaveBeenCalledWith("/checkout"));
    expect(mockSignIn).toHaveBeenCalledWith("credentials", expect.objectContaining({
      email: "shopper-a@example.test", password: "Pantry-test-2026", redirect: false, callbackUrl: "/checkout",
    }));
  });

  it.each([
    ["https://evil.example"],
    ["//evil.example"],
    ["/\\evil.example"],
  ])("lands on the homepage for callbackUrl=%s", async (callbackUrl) => {
    query = `callbackUrl=${encodeURIComponent(callbackUrl)}`;
    mockSignIn.mockResolvedValue({ ok: true, error: null, status: 200, url: "http://localhost/" });
    render(<Signin />);
    type(/^email$/i, "shopper-a@example.test");
    type(/^password$/i, "Pantry-test-2026");
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(hardNavigate).toHaveBeenCalledWith("/"));
    expect(hrefOf(/create an account/i)).toBe("/auth/signup");
  });

  it("accepts an absolute callbackUrl on this site, as the chat assistant sends it", async () => {
    query = `callbackUrl=${encodeURIComponent("http://localhost/shop?category=spices")}`;
    render(<Signin />);
    await waitFor(() => expect(hrefOf(/create an account/i)).toBe("/auth/signup?callbackUrl=%2Fshop%3Fcategory%3Dspices"));
  });

  it("announces a wrong password, keeps the email and focuses the password", async () => {
    mockSignIn.mockResolvedValue({ ok: false, error: "CredentialsSignin", status: 401, url: null });
    render(<Signin />);
    type(/^email$/i, "shopper-a@example.test");
    type(/^password$/i, "not-my-password");
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("That email and password don’t match");
    expect(screen.getByLabelText(/^email$/i)).toHaveValue("shopper-a@example.test");
    const password = screen.getByLabelText(/^password$/i);
    await waitFor(() => expect(password).toHaveFocus());
    expect(password.getAttribute("aria-describedby")).toContain(alert.id);
    expect(hardNavigate).not.toHaveBeenCalled();
  });

  it("explains empty fields next to the field and focuses the first one", () => {
    render(<Signin />);
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    const email = screen.getByLabelText(/^email$/i);
    expect(email).toHaveFocus();
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription("Email is required");
    expect(screen.getByLabelText(/^password$/i)).toHaveAccessibleDescription("Enter your password");
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("shows and hides the password with a real button", () => {
    render(<Signin />);
    const password = screen.getByLabelText(/^password$/i);
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByLabelText(/^email$/i)).toHaveAttribute("autocomplete", "username");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password).toHaveAttribute("type", "password");
  });

  it("keeps callbackUrl on the links to sign-up and password recovery, and on Google sign-in", () => {
    query = "callbackUrl=%2Fcheckout";
    render(<Signin />);
    expect(hrefOf(/create an account/i)).toBe("/auth/signup?callbackUrl=%2Fcheckout");
    expect(hrefOf(/forgot password/i)).toBe("/auth/forgot-password?callbackUrl=%2Fcheckout");
    expect(hrefOf(/check out as a guest/i)).toBe("/checkout");
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));
    expect(mockSignIn).toHaveBeenCalledWith("google", { callbackUrl: "/checkout" });
  });

  it("sends a shopper who is already signed in to the callbackUrl", () => {
    query = "callbackUrl=%2Forders";
    mockSession.mockReturnValue({ data: { user: { email: "shopper-a@example.test" } }, status: "authenticated" });
    render(<Signin />);
    expect(replace).toHaveBeenCalledWith("/orders");
  });

  it("explains a NextAuth error code from the URL", () => {
    query = "error=OAuthAccountNotLinked";
    render(<Signin />);
    expect(screen.getByRole("alert")).toHaveTextContent("already has a Kosvana account with a password");
  });
});

describe("Sign up", () => {
  function fillValidForm() {
    type(/full name/i, "Asha Rawat");
    type(/^email$/i, "asha@example.test");
    type(/^password$/i, "Pantry-test-2026");
    type(/confirm password/i, "Pantry-test-2026");
    fireEvent.click(screen.getByLabelText(/i agree/i));
  }

  it("uses visible labels and the right autocomplete tokens", () => {
    render(<Signup />);
    expect(screen.getByLabelText(/full name/i)).toHaveAttribute("autocomplete", "name");
    expect(screen.getByLabelText(/^email$/i)).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText(/mobile number/i)).toHaveAttribute("autocomplete", "tel-national");
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute("autocomplete", "new-password");
    expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute("autocomplete", "new-password");
  });

  it("flags every invalid field and focuses the first", () => {
    render(<Signup />);
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(screen.getByLabelText(/full name/i)).toHaveFocus();
    expect(screen.getByLabelText(/i agree/i)).toHaveAccessibleDescription("Agree to the terms to create an account");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("verifies the emailed code, signs in and returns to the callbackUrl", async () => {
    query = "callbackUrl=%2Fcheckout";
    mockFetch.mockImplementation((url: string) => respond(200, url.includes("register") ? { user: {} } : { message: "sent" }));
    mockSignIn.mockResolvedValue({ ok: true, error: null, status: 200, url: "http://localhost/checkout" });
    render(<Signup />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    const dialog = await screen.findByRole("dialog", { name: "Check your email" });
    const code = within(dialog).getByLabelText(/6-digit code/i);
    expect(code).toHaveAttribute("autocomplete", "one-time-code");
    expect(code).toHaveFocus();
    fireEvent.change(code, { target: { value: "123456" } });
    fireEvent.click(within(dialog).getByRole("button", { name: /verify and create account/i }));

    await waitFor(() => expect(hardNavigate).toHaveBeenCalledWith("/checkout"));
    expect(mockFetch).toHaveBeenCalledWith("/api/auth/register", expect.objectContaining({ method: "POST" }));
    expect(mockSignIn).toHaveBeenCalledWith("credentials", expect.objectContaining({ email: "asha@example.test", callbackUrl: "/checkout" }));
  });

  it("announces a rejected code inside the dialog and clears it for another try", async () => {
    mockFetch.mockImplementation((url: string) => url.includes("register") ? respond(400, { error: "Invalid OTP" }) : respond(200, {}));
    render(<Signup />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    const dialog = await screen.findByRole("dialog");
    const code = within(dialog).getByLabelText(/6-digit code/i);
    fireEvent.change(code, { target: { value: "000000" } });
    fireEvent.click(within(dialog).getByRole("button", { name: /verify and create account/i }));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("That code doesn’t match");
    expect(code).toHaveValue("");
    expect(code).toHaveFocus();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("offers sign-in and recovery when the email already has an account, keeping what was typed", async () => {
    query = "callbackUrl=%2Fcheckout";
    mockFetch.mockImplementation(() => respond(409, { error: "An account with this email already exists. Please sign in instead." }));
    render(<Signup />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    const alert = await screen.findByRole("alert");
    expect(within(alert).getByRole("link", { name: /sign in with this email/i })).toHaveAttribute("href", "/auth/signin?callbackUrl=%2Fcheckout");
    expect(screen.getByLabelText(/^email$/i)).toHaveValue("asha@example.test");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("Password recovery", () => {
  it("confirms the request without saying whether the account exists", async () => {
    mockFetch.mockImplementation(() => respond(200, { message: "If an account with that email exists, we have sent a password reset link." }));
    query = "callbackUrl=%2Fcheckout";
    render(<ForgotPassword />);
    type(/^email$/i, "shopper-a@example.test");
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));
    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("If there is a Kosvana account for shopper-a@example.test");
    await waitFor(() => expect(status).toHaveFocus());
    expect(hrefOf(/back to sign in/i)).toBe("/auth/signin?callbackUrl=%2Fcheckout");
  });

  it("announces a failed request and keeps the typed email", async () => {
    mockFetch.mockImplementation(() => respond(429, { error: "Too many requests. Please try again in 600 seconds." }));
    render(<ForgotPassword />);
    type(/^email$/i, "shopper-a@example.test");
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Too many requests");
    expect(screen.getByLabelText(/^email$/i)).toHaveValue("shopper-a@example.test");
  });

  it("explains an expired reset link and offers a new one", async () => {
    query = "token=expired-token&callbackUrl=%2Fcheckout";
    mockFetch.mockImplementation(() => respond(400, { error: "Invalid or expired reset token" }));
    render(<ResetPassword />);
    type(/^new password$/i, "Pantry-test-2027!");
    type(/confirm new password/i, "Pantry-test-2027!");
    fireEvent.click(screen.getByRole("button", { name: "Save new password" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("This reset link has expired or was already used.");
    await waitFor(() => expect(alert).toHaveFocus());
    expect(hrefOf(/request a new link/i)).toBe("/auth/forgot-password?callbackUrl=%2Fcheckout");
    expect(mockFetch).toHaveBeenCalledWith("/api/auth/reset-password", expect.objectContaining({ body: JSON.stringify({ token: "expired-token", password: "Pantry-test-2027!" }) }));
  });

  it("explains a link without a token before anyone types", () => {
    render(<ResetPassword />);
    expect(screen.getByRole("alert")).toHaveTextContent("This reset link is incomplete.");
    expect(screen.queryByLabelText(/^new password$/i)).not.toBeInTheDocument();
  });

  it("checks the new password before sending it", () => {
    query = "token=abc";
    render(<ResetPassword />);
    type(/^new password$/i, "Pantry-test-2027!");
    type(/confirm new password/i, "Pantry-test-2028!");
    fireEvent.click(screen.getByRole("button", { name: "Save new password" }));
    expect(screen.getByLabelText(/confirm new password/i)).toHaveFocus();
    expect(screen.getByLabelText(/confirm new password/i)).toHaveAccessibleDescription("The passwords don’t match");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("confirms a changed password and links to sign-in", async () => {
    query = "token=good-token";
    mockFetch.mockImplementation(() => respond(200, { message: "Password reset successfully" }));
    render(<ResetPassword />);
    type(/^new password$/i, "Pantry-test-2027!");
    type(/confirm new password/i, "Pantry-test-2027!");
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Save new password" })); });
    expect(await screen.findByRole("status")).toHaveTextContent("Your password is changed.");
    expect(hrefOf(/^sign in$/i)).toBe("/auth/signin");
  });
});

describe("Sign-in error page", () => {
  it("explains the NextAuth error and links back to sign-in", () => {
    query = "error=AccessDenied&callbackUrl=%2Fcheckout";
    render(<AuthError />);
    expect(screen.getByRole("alert")).toHaveTextContent("Google sign-in was cancelled");
    expect(hrefOf(/try signing in again/i)).toBe("/auth/signin?callbackUrl=%2Fcheckout");
  });
});
