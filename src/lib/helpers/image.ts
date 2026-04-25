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
// Utilidades para procesamiento de imágenes
// usando Canvas API nativa del navegador
// ============================================

interface ProcessImageOptions {
  /** Ancho máximo del canvas de salida en px */
  targetWidth?: number;
  /** Alto máximo del canvas de salida en px. null = proporcional al ancho */
  targetHeight?: number | null;
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
    maxSizeBytes = 150 * 1024, // 150kb por defecto para productos
  } = options;

  // 1. Cargar la imagen en un elemento HTMLImageElement
  const img = await loadImage(file);

  // En logos (targetHeight = null), usamos alto proporcional con límite.
  const canvasHeight =
    targetHeight ??
    Math.min(
      Math.round(targetWidth * (img.height / img.width)),
      targetWidth * 2,
    );

  // 2. Productos/banners mantienen letterbox; logos ocupan todo el canvas.
  const { drawWidth, drawHeight, offsetX, offsetY } = targetHeight
    ? calculateLetterbox(img.width, img.height, targetWidth, canvasHeight)
    : {
        drawWidth: targetWidth,
        drawHeight: canvasHeight,
        offsetX: 0,
        offsetY: 0,
      };

  // 3. Crear canvas y dibujar
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo obtener el contexto del canvas");

  // Solo rellenamos fondo cuando hay letterbox.
  if (targetHeight) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, targetWidth, canvasHeight);
  }

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
  initialQuality: number,
  maxSizeBytes: number,
): Promise<File> {
  let quality = initialQuality;
  let workingCanvas = canvas;

  //Loop principal
  while (true) {
    let blob = await canvasToBlob(workingCanvas, "image/webp", quality);

    if (blob.size <= maxSizeBytes) {
      return buildFile(blob, originalName);
    }

    //FASE 1: bajar calidad (pero con límite sano)
    if (quality > 0.6) {
      quality -= 0.05;
      continue;
    }

    //FASE 2: reducir resolución
    const nextWidth = Math.floor(workingCanvas.width * 0.85);
    const nextHeight = Math.floor(workingCanvas.height * 0.85);

    //límite mínimo (evitar imágenes feas)
    if (nextWidth < 600) {
      return buildFile(blob, originalName); // mejor esto que destruir la imagen
    }

    const newCanvas = document.createElement("canvas");
    newCanvas.width = nextWidth;
    newCanvas.height = nextHeight;

    const ctx = newCanvas.getContext("2d")!;
    ctx.drawImage(workingCanvas, 0, 0, nextWidth, nextHeight);

    workingCanvas = newCanvas;

    // 🔄 MUY IMPORTANTE: resetear calidad
    quality = initialQuality;
  }
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
