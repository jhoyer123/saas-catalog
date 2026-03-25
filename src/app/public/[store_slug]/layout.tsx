import Script from "next/script";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const umamiId = process.env.NEXT_PUBLIC_UMAMI_ID;

  return (
    <>
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
