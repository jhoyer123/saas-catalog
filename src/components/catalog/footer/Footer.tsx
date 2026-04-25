import Link from "next/link";
import {
  getPublicStoreBranches,
  getPublicStoreSocialMedia,
} from "@/lib/actions/catalogActions";
import { StoreCatalogData } from "@/types/catalog/catalog.types";
import Image from "next/image";
import { getCatalogImageUrl } from "@/lib/helpers/imageUrl";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={18}
      height={18}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.77.01 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-6.13 6.33 6.34 6.34 0 0012.67 0V8.85a8.16 8.16 0 004.77 1.52V6.91a4.85 4.85 0 01-1-.22z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
      <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
      <polygon
        points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
        style={{ fill: "var(--catalog-primary)" }}
      />
    </svg>
  ),
};

interface FooterProps {
  store: StoreCatalogData;
  storeSlug: string;
  storeId: string;
}

export default async function Footer({
  store,
  storeSlug,
  storeId,
}: FooterProps) {
  // Carga no crítica para no bloquear el contenido above-the-fold del catálogo.
  // Revertir es directo: volver a recibir branches/socialLinks por props desde el layout.
  const [branches, socialLinks] = await Promise.all([
    getPublicStoreBranches(storeSlug, storeId),
    getPublicStoreSocialMedia(storeSlug, storeId),
  ]);

  const year = new Date().getFullYear();
  const hasBranches = branches.length > 0;
  const hasSocials = socialLinks.length > 0;

  return (
    <footer className="w-full bg-catalog-primary border-t border-catalog-secondary/10">
      {/* Main grid */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Col 1 — Marca */}
        <div className="flex flex-col gap-4 items-start">
          <div className="flex items-center gap-3">
            {store.logo_url && (
              <Image
                src={
                  store.logo_url
                    ? `${getCatalogImageUrl(store.logo_url)}?v=${new Date(store.updated_at).getTime()}`
                    : "/images/store-placeholder.png"
                }
                alt={store.name}
                width={80} // Suficiente para un logo de 40px en pantalla
                height={80}
                loading="lazy"
                className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
              />
            )}
            <h2 className="text-2xl font-bold tracking-tight text-catalog-secondary/80">
              {store.name}
            </h2>
          </div>
          {store.description && (
            <p className="text-xs text-catalog-secondary/60 font-inter font-light leading-relaxed line-clamp-4 lg:text-sm">
              {store.description}
            </p>
          )}
          {store.whatsapp_number && (
            <Link
              href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, "")}`}
              target="_blank"
              className="flex items-center gap-2 border border-catalog-secondary/40 rounded-full px-4 py-1.5 text-xs text-catalog-secondary/60 hover:text-catalog-secondary hover:border-catalog-secondary/50 transition-colors font-light font-inter lg:text-sm"
            >
              WhatsApp
            </Link>
          )}
        </div>

        {/* Col 2 — Sucursales */}
        {hasBranches && (
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-medium font-inter tracking-[2px] uppercase text-catalog-secondary/50">
              Sucursales
            </span>
            {branches.map((branch) => (
              <div key={branch.id} className="flex flex-col gap-0.5">
                <span className="text-[12px] font-medium font-inter tracking-[1px] uppercase text-catalog-secondary/70 truncate">
                  {branch.name}
                </span>
                <span className="text-xs  text-catalog-secondary/60 font-inter font-light leading-relaxed line-clamp-2 lg:text-sm">
                  {branch.address}
                </span>
                <span className="text-xs  text-catalog-secondary/60 font-inter font-light leading-relaxed line-clamp-2 lg:text-sm">
                  {branch.phone && `Tel: ${branch.phone}`}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Col 3 — Redes */}
        {hasSocials && (
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-medium font-inter tracking-[2px] uppercase text-catalog-secondary/50">
              Redes sociales
            </span>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  title={link.platform}
                  className="w-11 h-11 rounded-full border border-catalog-secondary/50 flex items-center justify-center text-catalog-secondary/70 hover:text-catalog-secondary hover:border-catalog-secondary/60 transition-colors"
                >
                  {SOCIAL_ICONS[link.platform] ?? (
                    <span className="text-[11px] uppercase">
                      {link.platform.slice(0, 2)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Copyright */}
      <div className="border-t border-catalog-secondary/10 px-6 py-4 flex justify-center">
        <p className="text-[11px] text-catalog-secondary/50 tracking-wide font-light">
          © {year} {store.name} · Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
