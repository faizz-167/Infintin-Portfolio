/** Specimen-only rule; real form rules arrive with the contact page. */
export function emailRule(value: string): string | null {
  if (value.trim() === "") return "Enter your work email.";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ? null
    : "Enter an email address like name@company.com.";
}
