export function buildContactEmailHref(subject: string, body: string) {
  const params = new URLSearchParams({ subject, body });
  return `mailto:contacto@greenatics.com.co?${params.toString()}`;
}
