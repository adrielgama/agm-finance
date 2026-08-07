import "server-only";

const allowedEmails = (process.env.AUTH_ALLOWED_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isEmailAllowed(email: string | undefined | null) {
  if (!email) return false;
  return allowedEmails.includes(email.toLowerCase());
}
