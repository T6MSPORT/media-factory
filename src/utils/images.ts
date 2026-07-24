export type ImagePurpose = 'background' | 'portrait' | 'logo';

interface ImageRule {
  max: number;
  quality: number;
}

export const IMAGE_RULES: Record<ImagePurpose, ImageRule> = {
  background: { max: 2200, quality: 0.82 },
  portrait: { max: 1800, quality: 0.88 },
  logo: { max: 900, quality: 0.92 },
};

const loadImage = (source: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onerror = () => reject(new Error('The image could not be opened.'));
    image.onload = () => resolve(image);
    image.src = source;
  });

export const getImageDimensions = async (
  source: string,
): Promise<{ width: number; height: number }> => {
  const image = await loadImage(source);
  return { width: image.naturalWidth, height: image.naturalHeight };
};

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });

const trimTransparentPadding = (
  canvas: HTMLCanvasElement,
  purpose: Exclude<ImagePurpose, 'background'>,
): HTMLCanvasElement => {
  const context = canvas.getContext('2d');
  if (!context) return canvas;

  const { width, height } = canvas;
  const pixels = context.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (pixels[(y * width + x) * 4 + 3] > 8) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) return canvas;

  const paddingFactor = purpose === 'logo' ? 0.006 : 0.012;
  const padding = Math.max(
    purpose === 'logo' ? 2 : 4,
    Math.round(Math.max(width, height) * paddingFactor),
  );
  const sourceX = Math.max(0, minX - padding);
  const sourceY = Math.max(0, minY - padding);
  const sourceWidth = Math.min(width - sourceX, maxX - minX + 1 + padding * 2);
  const sourceHeight = Math.min(height - sourceY, maxY - minY + 1 + padding * 2);
  const trimmed = document.createElement('canvas');
  trimmed.width = sourceWidth;
  trimmed.height = sourceHeight;
  trimmed
    .getContext('2d')
    ?.drawImage(
      canvas,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth,
      sourceHeight,
    );
  return trimmed;
};

export const processImageFile = async (
  file: File,
  purpose: ImagePurpose = 'portrait',
): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file.');
  }

  const source = await readAsDataUrl(file);
  const image = await loadImage(source);
  const rule = IMAGE_RULES[purpose];
  const scale = Math.min(1, rule.max / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Image processing is unavailable.');
  }

  context.drawImage(image, 0, 0, width, height);
  const output =
    purpose === 'background' ? canvas : trimTransparentPadding(canvas, purpose);
  return output.toDataURL('image/webp', rule.quality);
};
