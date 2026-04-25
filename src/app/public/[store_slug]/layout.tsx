import Script from "next/script";
import { Suspense } from "react";
import { getPublicStore } from "@/lib/actions/catalogActions";
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
      {/* Preconnects van aquí, Next.js los mueve al <head> automáticamente */}
      <link
        rel="preconnect"
        href="https://supabase-images.jhoyervega4.workers.dev"
      />
      <link
        rel="dns-prefetch"
        href="https://supabase-images.jhoyervega4.workers.dev"
      />
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {umamiId && (
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id={umamiId}
          strategy="afterInteractive"
        />
      )}
      {/* Header no va en Suspense porque queremos que se pinte lo antes posible */}
      <Header store={store} />
      {/* el page */}
      {children}
      {/*
        Footer en Suspense para no bloquear el render inicial del catálogo.
        Rollback simple: volver a cargar branches/socialLinks en este layout
        y pasar props directas como antes.
      */}
      <Suspense fallback={<div className="h-20 w-full" aria-hidden="true" />}>
        <Footer store={store} storeSlug={store.slug} storeId={store.id} />
      </Suspense>
    </>
  );
}
