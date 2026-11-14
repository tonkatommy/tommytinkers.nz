// Sends email. Every email the site sends goes through sendEmail(), so there
// is one place that decides how.
//
// - With RESEND_API_KEY set, it sends through Resend.
// - Without one, outside production, it writes the email to a folder
//   instead (EMAIL_FILE_DIR, default .tmp/emails). That lets local dev and
//   the browser tests "receive" a verification link with no email account.
// - In production with no key it throws, so a missing key is noticed.
import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";

export type Email = {
  to: string;
  subject: string;
  /** Plain-text body. Every email has one; HTML is built from it. */
  text: string;
  /** Optional button: its link is also in the text. */
  action?: { label: string; url: string };
};

const FROM = process.env.EMAIL_FROM ?? "tommy tinkers NZ <hello@tommytinkers.nz>";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

// A deliberately plain HTML email: system fonts, one green button. Email
// clients ignore most CSS, so simple is what survives.
function toHtml({ text, action }: Email): string {
  const paragraphs = text
    .split("\n\n")
    .map((paragraph) => `<p style="margin:0 0 16px">${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const button = action
    ? `<p style="margin:24px 0"><a href="${escapeHtml(action.url)}" style="background:#2e7a1d;color:#fdf8ee;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600">${escapeHtml(action.label)}</a></p><p style="margin:0 0 16px;font-size:13px;color:#564a32">Button not working? Copy this into your browser:<br>${escapeHtml(action.url)}</p>`
    : "";
  return `<div style="font-family:system-ui,sans-serif;font-size:16px;line-height:1.6;color:#1a1816;max-width:520px">${paragraphs}${button}<p style="margin:24px 0 0;font-size:13px;color:#564a32">Tommy, tommy tinkers NZ, Helensville</p></div>`;
}

export async function sendEmail(email: Email): Promise<void> {
  const text = email.action ? `${email.text}\n\n${email.action.label}: ${email.action.url}` : email.text;
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    const { error } = await new Resend(apiKey).emails.send({
      from: FROM,
      to: email.to,
      subject: email.subject,
      text,
      html: toHtml(email),
    });
    // Log the reason but never the email body: it holds a sign-in link.
    if (error) throw new Error(`Email failed to send: ${error.name}`);
    return;
  }

  if (process.env.NODE_ENV === "production" && process.env.EMAIL_TO_FILE !== "1") {
    throw new Error("RESEND_API_KEY is not set, so email can't be sent.");
  }

  // The file sink. One JSON file per email, newest name sorts last.
  const dir = process.env.EMAIL_FILE_DIR ?? path.join(process.cwd(), ".tmp", "emails");
  await mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;
  await writeFile(path.join(dir, name), JSON.stringify({ ...email, text, from: FROM }, null, 2));
}
