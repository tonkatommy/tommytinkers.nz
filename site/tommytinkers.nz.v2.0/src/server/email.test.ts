import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A stand-in for Resend, so no test can ever reach the real service.
// vi.hoisted makes `send` exist before vi.mock runs (mocks are moved to the
// top of the file).
const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

import { sendEmail } from "@/server/email";

const email = { to: "sam@example.test", subject: "Hello", text: "A test email." };
let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "tt-email-"));
  vi.stubEnv("EMAIL_FILE_DIR", dir);
  send.mockReset();
  send.mockResolvedValue({ error: null });
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(dir, { recursive: true, force: true });
});

describe("sendEmail", () => {
  it("sends through Resend when there is a key", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_not_real");
    vi.stubEnv("EMAIL_TO_FILE", "");
    await sendEmail(email);
    expect(send).toHaveBeenCalledOnce();
    expect(await readdir(dir)).toHaveLength(0);
  });

  it("writes a file instead when EMAIL_TO_FILE=1, even with a key", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_not_real");
    vi.stubEnv("EMAIL_TO_FILE", "1");
    await sendEmail(email);
    expect(send).not.toHaveBeenCalled();
    const files = await readdir(dir);
    expect(files).toHaveLength(1);
    const saved = JSON.parse(await readFile(path.join(dir, files[0]), "utf8"));
    expect(saved).toMatchObject({ to: email.to, subject: email.subject });
  });

  it("writes a file outside production when there is no key", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("EMAIL_TO_FILE", "");
    await sendEmail(email);
    expect(send).not.toHaveBeenCalled();
    expect(await readdir(dir)).toHaveLength(1);
  });

  it("refuses in production with no key", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("EMAIL_TO_FILE", "");
    await expect(sendEmail(email)).rejects.toThrow("RESEND_API_KEY");
  });
});
