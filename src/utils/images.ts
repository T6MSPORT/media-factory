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

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });

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
  return canvas.toDataURL('image/webp', rule.quality);
};
