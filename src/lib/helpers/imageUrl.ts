//ESTA FUNCION DEVUELVE LA URL DE IMAGENES PUBLICAS DE STORES

//ESTO ES DE LA OTRA BASE DE DATOS DE SUPABASE LA DE jhoyervega4@gmail.com
/* const SUPABASE_STORAGE =
  "https://ffippkblrlgsmzlhretb.supabase.co/storage/v1/object/public/";
const CLOUDFLARE_WORKER = "https://supabase-images.jhoyervega4.workers.dev/"; */

//esto de la de la base de datos de test
const SUPABASE_STORAGE =
  "https://sgyhnurfolicvvtkoyun.supabase.co/storage/v1/object/public/";

const CLOUDFLARE_WORKER = "https://test-supabase.jhoyervega4.workers.dev/";

//esto no se toca es la funcion global que obtiene la imagen
export function getCatalogImageUrl(url: string | null | undefined): string {
  if (!url) return "/images/placeholder.webp";
  if (url.startsWith("http"))
    return url.replace(SUPABASE_STORAGE, CLOUDFLARE_WORKER + "stores/");
  return CLOUDFLARE_WORKER + "stores/" + url;
}