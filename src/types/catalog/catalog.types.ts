// Forma de cada banner que viene de la base de datos
export interface Banner {
  id: string;
  image_url: string;
}

export interface StoreCatalog {
  name: string;
  slug: string;
  logo_url: string | null;
  whatsapp_number?: string | null;
  updated_at: string; // Agregado para el cache busting
}

export interface BrandsCatalog {
  id: string;
  name: string;
  slug: string;
}

export interface BranchCatalog {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat?: number;
  lng?: number;
}

export interface SocialLinkCatalog {
  id: string;
  platform: string;
  url: string;
}

export interface StoreCatalogData {
  name: string;
  slug: string;
  logo_url: string | null;
  whatsapp_number?: string | null;
  updated_at: string;
  description?: string | null;
}

// Cuánto tiempo muestra cada banner antes de pasar al siguiente
export const AUTOPLAY_INTERVAL = 5000;

// Píxeles mínimos que tiene que moverse el dedo/mouse para contar como drag
export const DRAG_THRESHOLD = 5;

// Píxeles mínimos para que el drag cambie de slide (si no, vuelve al mismo)
export const SNAP_THRESHOLD = 80;
