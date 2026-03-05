// ============================================
// HELPERS
// ============================================

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
  // Validar tipo
  if (!file.type.startsWith("image/")) {
    return `${file.name} no es una imagen válida`;
  }

  // Validar tamaño
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return `${file.name} excede el tamaño máximo de ${maxSizeMB}MB`;
  }

  return null;
}

// ============================================
// image-utils.ts
// Utilidades para procesamiento de imágenes
// usando Canvas API nativa del navegador
// ============================================

interface ProcessImageOptions {
  /** Ancho máximo del canvas de salida en px */
  targetWidth?: number;
  /** Alto máximo del canvas de salida en px */
  targetHeight?: number;
  /** Color de fondo para el letterbox (default: blanco) */
  backgroundColor?: string;
  /** Calidad WebP entre 0 y 1 (default: 0.85) */
  quality?: number;
  /** Peso máximo en bytes. Si se supera, reduce calidad automáticamente */
  maxSizeBytes?: number;
}

/**
 * Procesa una imagen antes de subirla:
 * 1. Redimensiona manteniendo proporciones (sin recortar)
 * 2. Aplica letterbox con fondo de color para rellenar el espacio
 * 3. Convierte a WebP
 * 4. Comprime hasta respetar el peso máximo
 *
 * @param file - Archivo de imagen original
 * @param options - Opciones de procesamiento
 * @returns Nuevo File procesado en formato WebP
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
    maxSizeBytes = 200 * 1024, // 200kb por defecto
  } = options;

  // 1. Cargar la imagen en un elemento HTMLImageElement
  const img = await loadImage(file);

  // 2. Calcular dimensiones manteniendo proporción (letterbox)
  const { drawWidth, drawHeight, offsetX, offsetY } = calculateLetterbox(
    img.width,
    img.height,
    targetWidth,
    targetHeight,
  );

  // 3. Crear canvas y dibujar
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo obtener el contexto del canvas");

  // Fondo
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Imagen centrada
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  // 4. Exportar a WebP respetando el peso máximo
  const processedFile = await exportToWebP(
    canvas,
    file.name,
    quality,
    maxSizeBytes,
  );

  return processedFile;
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
 * Calcula posición y tamaño para centrar la imagen
 * dentro del canvas sin recortarla (letterbox)
 */
function calculateLetterbox(
  srcWidth: number,
  srcHeight: number,
  targetWidth: number,
  targetHeight: number,
) {
  const scaleX = targetWidth / srcWidth;
  const scaleY = targetHeight / srcHeight;

  // Tomamos la escala más pequeña para que quepa completa
  const scale = Math.min(scaleX, scaleY);

  const drawWidth = srcWidth * scale;
  const drawHeight = srcHeight * scale;

  // Centramos la imagen en el canvas
  const offsetX = (targetWidth - drawWidth) / 2;
  const offsetY = (targetHeight - drawHeight) / 2;

  return { drawWidth, drawHeight, offsetX, offsetY };
}

/**
 * Exporta el canvas a WebP.
 * Si supera maxSizeBytes, reduce la calidad progresivamente
 * hasta respetar el límite sin romper la imagen.
 */
async function exportToWebP(
  canvas: HTMLCanvasElement,
  originalName: string,
  quality: number,
  maxSizeBytes: number,
): Promise<File> {
  let currentQuality = quality;
  let blob: Blob | null = null;

  // Intentar reducir calidad hasta respetar el límite
  // Mínimo de calidad: 0.5 para no romper la imagen
  while (currentQuality >= 0.5) {
    blob = await canvasToBlob(canvas, "image/webp", currentQuality);

    if (blob.size <= maxSizeBytes) break;

    currentQuality -= 0.05;
  }

  // Si aun así supera el límite, usamos la última versión (calidad 0.5)
  if (!blob) {
    blob = await canvasToBlob(canvas, "image/webp", 0.5);
  }

  // Construir nombre del archivo con extensión .webp
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  const newName = `${baseName}.webp`;

  return new File([blob], newName, { type: "image/webp" });
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
