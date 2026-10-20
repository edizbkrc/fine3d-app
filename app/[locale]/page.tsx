import { redirect } from "next/navigation";

function isLocalBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  return (
    baseUrl.includes("localhost") ||
    baseUrl.includes("127.0.0.1") ||
    baseUrl.startsWith("http://192.") ||
    baseUrl.startsWith("http://10.")
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Localde marketing sitesine atma; sunum URL'leri ile çalışılır
  if (isLocalBaseUrl()) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ marginBottom: 8 }}>Fine3D (local)</h1>
          <p style={{ opacity: 0.75, maxWidth: 420 }}>
            Bu ortamda ana sayfa marketing sitesine yönlendirmez. Bir proje
            sunumu açmak için tenant/slug URL&apos;sini kullanın.
          </p>
          <p style={{ marginTop: 16, fontSize: 14, opacity: 0.6 }}>
            örn. /{locale}/dekorinsaat_1/royalkonutları-YnA6E-lzjqthshKc
          </p>
        </div>
      </main>
    );
  }

  redirect(`https://fine3d.com.tr/${locale}`);
}
