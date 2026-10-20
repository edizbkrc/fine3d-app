import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tenantId: string; projectSlug: string }>;
}): Promise<Metadata> {
  const { locale, tenantId, projectSlug } = await params;

  const startUrl = `/${locale}/${decodeURIComponent(tenantId)}/${decodeURIComponent(projectSlug)}`;

  return {
    manifest: `/api/manifest?startUrl=${encodeURIComponent(startUrl)}`,
  };
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
