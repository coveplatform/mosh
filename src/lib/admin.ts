// Admin email whitelist — add emails here to grant admin access
const ADMIN_EMAILS = [
  "kris.engelhardt4@gmail.com",
];

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
