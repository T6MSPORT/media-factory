export type RemovalProgress = (percentage: number) => void;

type RemovalConfig = {
  model: 'isnet_quint8';
  output: {
    format: 'image/png';
    quality: number;
  };
  progress: (_asset: string, current: number, total: number) => void;
};

export type BackgroundRemovalEngine = (
  image: Blob,
  config: RemovalConfig,
) => Promise<Blob>;

const loadEngine = async (): Promise<BackgroundRemovalEngine> => {
  const module = await import('@imgly/background-removal');
  return module.removeBackground as unknown as BackgroundRemovalEngine;
};

export async function removeImageBackground(
  image: File,
  onProgress: RemovalProgress = () => {},
  getEngine: () => Promise<BackgroundRemovalEngine> = loadEngine,
): Promise<Blob> {
  if (!image.type.startsWith('image/')) {
    throw new Error('Please select a JPEG, PNG or WebP image.');
  }

  const engine = await getEngine();
  return engine(image, {
    model: 'isnet_quint8',
    output: { format: 'image/png', quality: 1 },
    progress: (_asset, current, total) => {
      if (total > 0) {
        onProgress(Math.max(0, Math.min(100, Math.round((current / total) * 100))));
      }
    },
  });
}

export function backgroundRemovalFileName(originalName: string): string {
  const baseName = originalName.replace(/\.[^.]+$/, '').trim() || 'image';
  return `${baseName}-no-background.png`;
}
