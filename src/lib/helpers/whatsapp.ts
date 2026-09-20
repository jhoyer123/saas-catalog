export function normalizeWhatsAppNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function buildProductUrl(storeSlug: string, productSlug: string): string {
  return `/public/${storeSlug}/${productSlug}`;
}

export function buildProductInquiryMessage({
  name,
  url,
  price,
  options,
}: {
  name: string;
  url: string;
  price?: number;
  options?: { name: string; value: string }[];
}): string {
  const optionText = options?.length
    ? `\nVariantes: ${options.map((option) => `${option.name}: ${option.value}`).join(", ")}`
    : "";
  const priceText = price === undefined ? "" : `\nPrecio: Bs. ${price.toFixed(2)}`;

  return `¡Hola! Me gustaría hacer un pedido:\n\nProducto: ${name}\nEnlace: ${url}${priceText}${optionText}\n\n¿Está disponible? Me gustaría más información`;
}