import { ImagePreview } from "@/components/products/form/InputFile";

/**
 * Convierte FileList a array de previews
 */
export function createPreviewsFromFileList(fileList: FileList): ImagePreview[] {
  return Array.from(fileList).map((file) => ({
    file,
    url: URL.createObjectURL(file),
  }));
}

/**
 * Convierte array de Files a FileList
 */
export function createFileListFromArray(files: File[]): FileList {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  return dataTransfer.files;
}

/**
 * Valida un archivo individual
 */
export function validateFile(file: File, maxSizeMB: number): string | null {
  if (!file.type.startsWith("image/")) {
    return `${file.name} no es una imagen válida`;
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return `${file.name} excede el tamaño máximo de ${maxSizeMB}MB`;
  }

  return null;
}

/**
 * Validar tamaño del archivo solo para banner
 */
export async function validateImageDimensions(
  file: File,
  minWidth: number,
  minHeight: number,
): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width < minWidth || img.height < minHeight) {
        resolve(
          `${file.name} debe ser mínimo ${minWidth}x${minHeight}px de tamaño`,
        );
      } else {
        resolve(null);
      }
    };
    img.src = URL.createObjectURL(file);
  });
}

// ============================================
// image-utils.ts
// Procesamiento de imágenes con Canvas API.
// SOLO WebP. Si no se logra el peso máximo, lanza error.
// ============================================

/**
 * La imagen no se pudo dejar dentro del peso permitido
 * (ni siquiera reduciendo calidad y tamaño hasta el mínimo).
 */
export class ImageTooHeavyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageTooHeavyError";
  }
}

/**
 * El navegador no sabe codificar WebP con canvas (ej: Safari).
 */
export class WebPNotSupportedError extends Error {
  constructor() {
    super(
      "Tu navegador no permite procesar imágenes WebP. Usa Chrome, Edge o Firefox.",
    );
    this.name = "WebPNotSupportedError";
  }
}

interface ProcessImageOptions {
  /** Ancho del canvas de salida en px */
  targetWidth?: number;
  /** Alto del canvas de salida en px. null = proporcional al ancho (logos) */
  targetHeight?: number | null;
  /** Color de fondo para el letterbox (default: blanco) */
  backgroundColor?: string;
  /** Calidad WebP máxima con la que se intenta primero (default: 0.85) */
  quality?: number;
  /** Calidad WebP mínima permitida antes de reducir dimensiones (default: 0.6) */
  minQuality?: number;
  /**
   * Ancho mínimo al que se permite reducir la imagen (default: 600).
   * Si es mayor o igual a targetWidth, nunca se reducen las dimensiones,
   * solo la calidad.
   */
  minWidth?: number;
  /** Peso máximo en bytes. ES LA REGLA: nunca se devuelve algo más pesado */
  maxSizeBytes?: number;
  /** Mensaje del error si no se logra el peso máximo */
  errorMessage?: string;
}

/**
 * Procesa una imagen antes de subirla:
 * 1. Redimensiona manteniendo proporciones (sin recortar)
 * 2. Aplica letterbox con fondo de color (productos/banners)
 * 3. Convierte a WebP
 * 4. Ajusta calidad y, si hace falta, dimensiones, hasta cumplir maxSizeBytes
 *
 * Si no lo logra lanza ImageTooHeavyError con `errorMessage`.
 * Si el navegador no soporta WebP lanza WebPNotSupportedError.
 *
 * Ejemplo de uso:
 *
 *   try {
 *     const processed = await processImage(file, {
 *       maxSizeBytes: 150 * 1024,
 *       errorMessage: "La imagen del producto es demasiado pesada",
 *     });
 *   } catch (e) {
 *     if (e instanceof ImageTooHeavyError || e instanceof WebPNotSupportedError) {
 *       toast.error(e.message);
 *     } else {
 *       throw e;
 *     }
 *   }
 */
export async function processImage(
  file: File,
  options: ProcessImageOptions = {},
): Promise<File> {
  const {
    targetWidth = 800,
    targetHeight = 800,
    backgroundColor = "#ffffff",
    quality = 0.85,
    minQuality = 0.6,
    minWidth = 600,
    maxSizeBytes = 150 * 1024,
    errorMessage = "La imagen es demasiado pesada. Prueba con otra imagen.",
  } = options;

  const img = await loadImage(file);

  // Logos (targetHeight = null): alto proporcional con límite.
  const baseHeight =
    targetHeight ??
    Math.min(
      Math.round(targetWidth * (img.height / img.width)),
      targetWidth * 2,
    );
  const useLetterbox = targetHeight !== null;

  // scale = 1 → tamaño completo. Baja 15% en cada vuelta si no cabe.
  let scale = 1;

  while (true) {
    const width = Math.round(targetWidth * scale);
    const height = Math.round(baseHeight * scale);

    // Nunca reducimos por debajo del mínimo (evita imágenes destruidas)
    if (scale < 1 && width < minWidth) {
      throw new ImageTooHeavyError(errorMessage);
    }

    // Siempre dibujamos desde la imagen ORIGINAL (no desde un canvas ya
    // reducido) para no acumular pérdida de calidad en cada reducción.
    const canvas = renderCanvas(
      img,
      width,
      height,
      useLetterbox,
      backgroundColor,
    );

    const blob = await encodeUnderLimit(
      canvas,
      maxSizeBytes,
      minQuality,
      quality,
    );

    if (blob) return buildFile(blob, file.name);

    scale *= 0.85;
  }
}

// ============================================
// HELPERS INTERNOS
// ============================================

/**
 * Carga un File en un HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`No se pudo cargar la imagen: ${file.name}`));
    };

    img.src = url;
  });
}

/**
 * Dibuja la imagen original en un canvas nuevo del tamaño indicado
 */
function renderCanvas(
  img: HTMLImageElement,
  width: number,
  height: number,
  useLetterbox: boolean,
  backgroundColor: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo obtener el contexto del canvas");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (useLetterbox) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const { drawWidth, drawHeight, offsetX, offsetY } = calculateLetterbox(
      img.width,
      img.height,
      width,
      height,
    );
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  } else {
    // Logos: ocupan todo el canvas (conserva transparencia)
    ctx.drawImage(img, 0, 0, width, height);
  }

  return canvas;
}

/**
 * Calcula posición y tamaño para centrar la imagen
 * dentro del canvas sin recortarla (letterbox)
 */
function calculateLetterbox(
  srcWidth: number,
  srcHeight: number,
  targetWidth: number,
  targetHeight: number,
) {
  const scale = Math.min(targetWidth / srcWidth, targetHeight / srcHeight);

  const drawWidth = srcWidth * scale;
  const drawHeight = srcHeight * scale;

  const offsetX = (targetWidth - drawWidth) / 2;
  const offsetY = (targetHeight - drawHeight) / 2;

  return { drawWidth, drawHeight, offsetX, offsetY };
}

/**
 * Intenta dejar el canvas en WebP dentro de maxBytes SIN cambiar dimensiones.
 * - Prueba con la calidad máxima (caso común: cabe a la primera).
 * - Si no cabe, prueba con la mínima. Si ni así cabe, devuelve null
 *   (el llamador reducirá dimensiones).
 * - Si cabe con la mínima, busca la MEJOR calidad que aún cumple (búsqueda
 *   binaria, 5 pasos).
 */
async function encodeUnderLimit(
  canvas: HTMLCanvasElement,
  maxBytes: number,
  minQuality: number,
  maxQuality: number,
): Promise<Blob | null> {
  const top = await canvasToWebP(canvas, maxQuality);
  if (top.size <= maxBytes) return top;

  const floor = await canvasToWebP(canvas, minQuality);
  if (floor.size > maxBytes) return null;

  let best = floor;
  let lo = minQuality; // sabemos que cabe
  let hi = maxQuality; // sabemos que no cabe

  for (let i = 0; i < 5; i++) {
    const mid = (lo + hi) / 2;
    const blob = await canvasToWebP(canvas, mid);
    if (blob.size <= maxBytes) {
      best = blob;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return best;
}

/**
 * canvas.toBlob a WebP. Si el navegador devuelve otro formato
 * (Safari devuelve PNG), lanza error en vez de seguir con un archivo falso.
 */
async function canvasToWebP(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  const blob = await canvasToBlob(canvas, "image/webp", quality);
  if (blob.type !== "image/webp") throw new WebPNotSupportedError();
  return blob;
}

function buildFile(blob: Blob, originalName: string): File {
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  return new File([blob], `${baseName}.webp`, { type: "image/webp" });
}

/**
 * Wrapper promisificado de canvas.toBlob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("No se pudo convertir el canvas a Blob"));
      },
      type,
      quality,
    );
  });
}
