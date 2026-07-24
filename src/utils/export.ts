import type { FormatId } from '../types';
import { getCanvasDimensions, toSafeFileName } from './format';

export async function exportSvgAsPng(
  node: SVGSVGElement,
  format: FormatId,
  projectName: string,
) {
  try {
    await document.fonts?.ready;
  } catch {
    // The browser can still export using its available font fallback.
  }

  const xml = new XMLSerializer().serializeToString(node);
  const svgBlob = new Blob([xml], { type: 'image/svg+xml' });
  const svgUrl = URL.createObjectURL(svgBlob);
  const image = new Image();

  image.onload = () => {
    const { width, height } = getCanvasDimensions(format);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0, width, height);
    URL.revokeObjectURL(svgUrl);

    canvas.toBlob(blob => {
      if (!blob) return;

      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob);
      anchor.download = `${toSafeFileName(projectName)}.png`;
      anchor.click();
      URL.revokeObjectURL(anchor.href);
    }, 'image/png');
  };

  image.src = svgUrl;
}
