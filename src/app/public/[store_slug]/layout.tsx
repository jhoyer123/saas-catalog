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
      --catalog-tertiary: ${store.tertiary_color ?? "#121212"};
    }
  `;

  const umamiId = process.env.NEXT_PUBLIC_UMAMI_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

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
      {/* Google Analytics - sin afectar performance */}
      {/*   {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
 */}
      {children}
    </>
  );
}
