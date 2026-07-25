import type { FormatId } from '../types';
import { getCanvasDimensions, toSafeFileName } from './format';

export type PngExportPlan = {
  width: number;
  height: number;
  fileName: string;
  mimeType: 'image/png';
};

export function getPngExportPlan(
  format: FormatId,
  projectName: string,
): PngExportPlan {
  const { width, height } = getCanvasDimensions(format);
  return {
    width,
    height,
    fileName: `${toSafeFileName(projectName)}.png`,
    mimeType: 'image/png',
  };
}

export async function exportSvgAsPng(
  node: SVGSVGElement,
  format: FormatId,
  projectName: string,
): Promise<void> {
  try {
    await document.fonts?.ready;
  } catch {
    // The browser can still export using its available font fallback.
  }

  const xml = new XMLSerializer().serializeToString(node);
  const svgBlob = new Blob([xml], { type: 'image/svg+xml' });
  const svgUrl = URL.createObjectURL(svgBlob);
  const image = new Image();

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const plan = getPngExportPlan(format, projectName);
      const canvas = document.createElement('canvas');
      canvas.width = plan.width;
      canvas.height = plan.height;

      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('PNG canvas could not be created.'));
        return;
      }

      context.drawImage(image, 0, 0, plan.width, plan.height);
      URL.revokeObjectURL(svgUrl);

      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error('PNG data could not be generated.'));
          return;
        }

        const anchor = document.createElement('a');
        anchor.href = URL.createObjectURL(blob);
        anchor.download = plan.fileName;
        anchor.click();
        URL.revokeObjectURL(anchor.href);
        resolve();
      }, plan.mimeType);
    };

    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error('The SVG preview could not be loaded for export.'));
    };

    image.src = svgUrl;
  });
}
