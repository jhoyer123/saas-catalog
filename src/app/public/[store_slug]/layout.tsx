import Script from "next/script";
import { getPublicStore } from "@/lib/actions/catalogActions";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ store_slug: string }>;
}) {
  const { store_slug } = await params;
  const store = await getPublicStore(store_slug);

  const css = `
    :root {
      --catalog-primary: ${store.primary_color ?? "#000000"};
      --catalog-secondary: ${store.secondary_color ?? "#ffffff"};
    }
  `;

  const umamiId = process.env.NEXT_PUBLIC_UMAMI_ID;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {umamiId && (
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id={umamiId}
          strategy="afterInteractive"
        />
      )}
      {children}
    </>
  );
}
