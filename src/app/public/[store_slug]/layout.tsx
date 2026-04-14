import Script from "next/script";
import {
  getPublicStore,
  getPublicStoreBranches,
  getPublicStoreSocialMedia,
} from "@/lib/actions/catalogActions";
import Header from "@/components/catalog/header/Header";
import Footer from "@/components/catalog/footer/Footer";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ store_slug: string }>;
}) {
  const { store_slug } = await params;
  const store = await getPublicStore(store_slug);

  // 2. Las que dependen del id, en paralelo
  const [branches, socialLinks] = await Promise.all([
    getPublicStoreBranches(store.slug, store.id),
    getPublicStoreSocialMedia(store.slug, store.id),
  ]);

  const css = `
    :root {
      --catalog-primary: ${store.primary_color ?? "#000000"};
      --catalog-secondary: ${store.secondary_color ?? "#ffffff"};
      --catalog-tertiary: ${store.tertiary_color ?? "#121212"};
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
      <Header store={store} />
      {children}
      <Footer branches={branches} socialLinks={socialLinks} store={store} />
    </>
  );
}
