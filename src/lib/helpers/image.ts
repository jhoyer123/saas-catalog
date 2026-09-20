
// ============================================
// image-utils.ts
// Procesamiento de imágenes en el navegador
// usando Canvas API nativa
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
  /** Ancho máximo del canvas de salida */
  targetWidth?: number;

  /**
   * Alto máximo del canvas.
   *
   * null = mantiene proporción de la imagen
   * usando targetWidth como límite.
   */
  targetHeight?: number | null;

  /** Color utilizado para letterbox */
  backgroundColor?: string;

  /** Calidad inicial de WebP (0 - 1) */
  quality?: number;

  /** Peso máximo permitido */
  maxSizeBytes?: number;

  /**
   * Resolución mínima permitida cuando hay que
   * reducir el canvas para conseguir el peso máximo.
   */
  minWidth?: number;

  minHeight?: number;
}

// ============================================
// PERFILES
// ============================================

/**
 * Imágenes de productos
 *
 * Objetivo:
 * - Máximo 800x800
 * - WebP
 * - Máximo 120 KB
 */
export const PRODUCT_IMAGE_OPTIONS: ProcessImageOptions = {
  targetWidth: 800,
  targetHeight: 800,
  quality: 0.9,
  maxSizeBytes: 120 * 1024,
  minWidth: 320,
  minHeight: 320,
};

/**
 * Banners
 *
 * Objetivo:
 * - 1600x600
 * - WebP
 * - Máximo 300 KB
 */
export const BANNER_IMAGE_OPTIONS: ProcessImageOptions = {
  targetWidth: 1600,
  targetHeight: 600,
  quality: 0.9,
  maxSizeBytes: 300 * 1024,
  minWidth: 640,
  minHeight: 240,
};

/**
 * Logos
 *
 * Mantienen proporción.
 * Puedes cambiar estos valores según el diseño
 * de tu catálogo.
 */
export const LOGO_IMAGE_OPTIONS: ProcessImageOptions = {
  targetWidth: 800,
  targetHeight: null,
  quality: 0.9,
  maxSizeBytes: 120 * 1024,
  minWidth: 320,
  minHeight: 100,
};

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

/**
 * Procesa una imagen antes de subirla:
 *
 * 1. Carga la imagen.
 * 2. Redimensiona.
 * 3. Mantiene proporciones.
 * 4. Aplica letterbox cuando corresponde.
 * 5. Convierte a WebP.
 * 6. Busca la mejor calidad posible.
 * 7. Si todavía supera el límite, reduce resolución.
 * 8. Repite hasta quedar dentro del peso máximo.
 *
 * IMPORTANTE:
 * Nunca devuelve un archivo superior a maxSizeBytes.
 */
export async function processImage(
  file: File,
  options: ProcessImageOptions = {},
): Promise<File> {
  const {
    targetWidth = 800,
    targetHeight = 800,
    backgroundColor = "#ffffff",
    quality = 0.9,
    maxSizeBytes = 120 * 1024,
    minWidth = 320,
    minHeight = 320,
  } = options;

  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} no es una imagen válida`);
  }

  if (maxSizeBytes <= 0) {
    throw new Error("maxSizeBytes debe ser mayor que 0");
  }

  if (quality <= 0 || quality > 1) {
    throw new Error("quality debe estar entre 0 y 1");
  }

  // ==========================================
  // 1. Cargar imagen
  // ==========================================

  const img = await loadImage(file);

  if (!img.width || !img.height) {
    throw new Error(`La imagen ${file.name} tiene dimensiones inválidas`);
  }

  // ==========================================
  // 2. Calcular dimensiones
  // ==========================================

  const canvasHeight =
    targetHeight === null
      ? Math.min(
          Math.round(targetWidth * (img.height / img.width)),
          targetWidth * 2,
        )
      : targetHeight;

  // ==========================================
  // 3. Calcular cómo colocar la imagen
  // ==========================================

  const layout =
    targetHeight === null
      ? {
          drawWidth: targetWidth,
          drawHeight: canvasHeight,
          offsetX: 0,
          offsetY: 0,
        }
      : calculateLetterbox(
          img.width,
          img.height,
          targetWidth,
          canvasHeight,
        );

  // ==========================================
  // 4. Crear canvas
  // ==========================================

  const canvas = document.createElement("canvas");

  canvas.width = targetWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No se pudo obtener el contexto del canvas");
  }

  // ==========================================
  // 5. Configuración de calidad de render
  // ==========================================

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // ==========================================
  // 6. Fondo
  // ==========================================

  if (targetHeight !== null) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, targetWidth, canvasHeight);
  }

  // ==========================================
  // 7. Dibujar imagen
  // ==========================================

  ctx.drawImage(
    img,
    layout.offsetX,
    layout.offsetY,
    layout.drawWidth,
    layout.drawHeight,
  );

  // ==========================================
  // 8. Comprimir
  // ==========================================

  return exportToWebP(
    canvas,
    file.name,
    quality,
    maxSizeBytes,
    minWidth,
    minHeight,
  );
}

// ============================================
// CARGAR IMAGEN
// ============================================

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
      reject(
        new Error(`No se pudo cargar la imagen: ${file.name}`),
      );
    };

    img.src = url;
  });
}

// ============================================
// LETTERBOX
// ============================================

function calculateLetterbox(
  srcWidth: number,
  srcHeight: number,
  targetWidth: number,
  targetHeight: number,
) {
  const scaleX = targetWidth / srcWidth;
  const scaleY = targetHeight / srcHeight;

  // La escala más pequeña garantiza
  // que toda la imagen entre sin recortarla.
  const scale = Math.min(scaleX, scaleY);

  const drawWidth = srcWidth * scale;
  const drawHeight = srcHeight * scale;

  const offsetX = (targetWidth - drawWidth) / 2;
  const offsetY = (targetHeight - drawHeight) / 2;

  return {
    drawWidth,
    drawHeight,
    offsetX,
    offsetY,
  };
}

// ============================================
// EXPORTAR A WEBP
// ============================================

async function exportToWebP(
  canvas: HTMLCanvasElement,
  originalName: string,
  initialQuality: number,
  maxSizeBytes: number,
  minWidth: number,
  minHeight: number,
): Promise<File> {
  let workingCanvas = canvas;

  // ==========================================
  // BUCLE PRINCIPAL
  // ==========================================

  while (true) {
    // ------------------------------------------
    // 1. Primer intento con calidad inicial
    // ------------------------------------------

    const initialBlob = await canvasToBlob(
      workingCanvas,
      "image/webp",
      initialQuality,
    );

    if (initialBlob.size <= maxSizeBytes) {
      return buildFile(initialBlob, originalName);
    }

    // ------------------------------------------
    // 2. Buscar mejor calidad con búsqueda binaria
    // ------------------------------------------

    let low = 0.15;
    let high = initialQuality;

    let bestBlob: Blob | null = null;

    /**
     * En lugar de probar:
     *
     * 0.90
     * 0.85
     * 0.80
     * 0.75
     * ...
     *
     * usamos búsqueda binaria para encontrar
     * rápidamente la mejor calidad que entre
     * en el límite.
     */
    for (let i = 0; i < 8; i++) {
      const testQuality = (low + high) / 2;

      const testBlob = await canvasToBlob(
        workingCanvas,
        "image/webp",
        testQuality,
      );

      if (testBlob.size <= maxSizeBytes) {
        bestBlob = testBlob;

        // Podemos intentar subir calidad.
        low = testQuality;
      } else {
        // Tenemos que bajar calidad.
        high = testQuality;
      }
    }

    // ------------------------------------------
    // 3. Encontramos una calidad válida
    // ------------------------------------------

    if (bestBlob) {
      return buildFile(bestBlob, originalName);
    }

    // ------------------------------------------
    // 4. Ni con calidad baja entra.
    //    Reducimos resolución.
    // ------------------------------------------

    const scale = 0.85;

    const nextWidth = Math.floor(
      workingCanvas.width * scale,
    );

    const nextHeight = Math.floor(
      workingCanvas.height * scale,
    );

    // ------------------------------------------
    // 5. Verificar resolución mínima
    // ------------------------------------------

    if (
      nextWidth < minWidth ||
      nextHeight < minHeight
    ) {
      /**
       * Último intento con calidad mínima.
       */

      const finalBlob = await canvasToBlob(
        workingCanvas,
        "image/webp",
        0.1,
      );

      if (finalBlob.size <= maxSizeBytes) {
        return buildFile(finalBlob, originalName);
      }

      /**
       * MUY IMPORTANTE:
       *
       * Nunca devolvemos una imagen que
       * supere maxSizeBytes.
       */
      throw new Error(
        `No se pudo comprimir "${originalName}" ` +
          `por debajo de ${formatBytes(maxSizeBytes)}. ` +
          `Peso obtenido: ${formatBytes(finalBlob.size)}.`,
      );
    }

    // ------------------------------------------
    // 6. Crear canvas reducido
    // ------------------------------------------

    const newCanvas = document.createElement("canvas");

    newCanvas.width = nextWidth;
    newCanvas.height = nextHeight;

    const ctx = newCanvas.getContext("2d");

    if (!ctx) {
      throw new Error(
        "No se pudo obtener el contexto del canvas",
      );
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      workingCanvas,
      0,
      0,
      nextWidth,
      nextHeight,
    );

    workingCanvas = newCanvas;
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

// ============================================
// CANVAS → BLOB
// ============================================

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              "No se pudo convertir el canvas a Blob",
            ),
          );

          return;
        }

        resolve(blob);
      },
      type,
      quality,
    );
  });
}

// ============================================
// BLOB → FILE
// ============================================

function buildFile(
  blob: Blob,
  originalName: string,
): File {
  const baseName = originalName.replace(
    /\.[^/.]+$/,
    "",
  );

  return new File(
    [blob],
    `${baseName}.webp`,
    {
      type: "image/webp",
      lastModified: Date.now(),
    },
  );
}

// ============================================
// FORMATEAR BYTES
// ============================================

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ============================================
// HELPERS OPCIONALES
// ============================================

/**
 * Convierte FileList a array de previews.
 */
export interface ImagePreview {
  file: File;
  url: string;
}

export function createPreviewsFromFileList(
  fileList: FileList,
): ImagePreview[] {
  return Array.from(fileList).map((file) => ({
    file,
    url: URL.createObjectURL(file),
  }));
}

/**
 * Convierte array de Files a FileList.
 */
export function createFileListFromArray(
  files: File[],
): FileList {
  const dataTransfer = new DataTransfer();

  files.forEach((file) => {
    dataTransfer.items.add(file);
  });

  return dataTransfer.files;
}

/**
 * Valida el tipo y tamaño original del archivo.
 */
export function validateFile(
  file: File,
  maxSizeMB: number,
): string | null {
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
 * Valida dimensiones mínimas.
 */
export async function validateImageDimensions(
  file: File,
  minWidth: number,
  minHeight: number,
): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      if (
        img.width < minWidth ||
        img.height < minHeight
      ) {
        resolve(
          `${file.name} debe ser mínimo ` +
            `${minWidth}x${minHeight}px de tamaño`,
        );
      } else {
        resolve(null);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(
        `No se pudo leer la imagen ${file.name}`,
      );
    };

    img.src = url;
  });
}
