/**
 * Utilities for client-side image compression using HTML5 Canvas.
 * Keeps Firestore free tier cost at $0 without needing Cloud Storage.
 */

export interface CompressionResult {
  base64: string;
  originalSizeKb: number;
  optimizedSizeKb: number;
  width: number;
  height: number;
  savingsPercent: number;
}

/**
 * Calculates target dimensions preserving aspect ratio with max boundary
 */
export function calculateTargetDimensions(
  origWidth: number,
  origHeight: number,
  maxDimension = 600
): { width: number; height: number } {
  if (origWidth <= 0 || origHeight <= 0) {
    return { width: maxDimension, height: maxDimension };
  }

  if (origWidth <= maxDimension && origHeight <= maxDimension) {
    return { width: origWidth, height: origHeight };
  }

  const ratio = origWidth / origHeight;
  if (origWidth > origHeight) {
    const width = maxDimension;
    const height = Math.round(maxDimension / ratio);
    return { width, height };
  } else {
    const height = maxDimension;
    const width = Math.round(maxDimension * ratio);
    return { width, height };
  }
}

/**
 * Format bytes to readable string (e.g. "3.8 MB", "42 KB")
 */
export function formatFileSize(kb: number): string {
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(1)} MB`;
  }
  return `${Math.round(kb)} KB`;
}

/**
 * Compresses an image file in the browser using HTML5 Canvas to WebP (quality 0.7)
 */
export async function compressImageFile(
  file: File,
  maxDimension = 600,
  quality = 0.7
): Promise<CompressionResult> {
  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagen no compatible.'));
      img.onload = () => {
        try {
          const { width, height } = calculateTargetDimensions(img.width, img.height, maxDimension);

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('No se pudo inicializar el contexto Canvas 2D.');
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(img, 0, 0, width, height);

          // Export as WebP with 0.7 quality
          let base64 = canvas.toDataURL('image/webp', quality);
          // If browser doesn't support webp, fallback to jpeg
          if (!base64.startsWith('data:image/webp')) {
            base64 = canvas.toDataURL('image/jpeg', quality);
          }

          // Calculate approximate base64 size in KB
          const stringLength = base64.length - 'data:image/webp;base64,'.length;
          const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.562489; // rough estimate
          const optimizedSizeKb = Math.max(1, Math.round(sizeInBytes / 1024));
          const savingsPercent = Math.max(
            0,
            Math.round(((originalSizeKb - optimizedSizeKb) / Math.max(1, originalSizeKb)) * 100)
          );

          resolve({
            base64,
            originalSizeKb,
            optimizedSizeKb,
            width,
            height,
            savingsPercent,
          });
        } catch (err) {
          reject(err);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
