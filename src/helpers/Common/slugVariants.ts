/** Türkçe i/ı karışıklığında slug adayları üretir. */
export function getSlugVariants(slug: string): string[] {
  const variants = new Set<string>([slug]);
  variants.add(slug.replace(/ı/g, "i").replace(/İ/g, "I"));
  variants.add(slug.replace(/i/g, "ı").replace(/I/g, "İ"));
  return [...variants];
}
