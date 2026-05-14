import { Point } from '../types';
import { worldToCanvas, CanvasTransform } from '../utils/canvasUtils';

interface ExportOptions {
  width: number;
  height: number;
  backgroundColor: string;
  resolution: number;
  transform: CanvasTransform;
  points: Point[];
  color: string;
  fileName?: string;
}

interface JPGOptions {
  backgroundColor: string;
  quality: number;
  fileName?: string;
}

const generateFileName = (baseName: string, extension: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${baseName}-${timestamp}.${extension}`;
};

export const exportService = {
  exportToPNG: (canvas: HTMLCanvasElement, options: Partial<ExportOptions> = {}): void => {
    const exportCanvas = document.createElement('canvas');
    const baseWidth = canvas.width;
    const baseHeight = canvas.height;
    const resolution = options.resolution || 2;

    exportCanvas.width = baseWidth * resolution;
    exportCanvas.height = baseHeight * resolution;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = options.backgroundColor || '#0f172a';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    if (options.points && options.transform && options.color) {
      const scale = options.transform.scale * resolution;
      const offsetX = options.transform.offsetX;
      const offsetY = options.transform.offsetY;

      ctx.fillStyle = options.color;

      for (let i = 0; i < options.points.length; i++) {
        const point = options.points[i];
        const canvasPoint: Point = {
          x: exportCanvas.width * offsetX + point.x * scale,
          y: exportCanvas.height * offsetY - point.y * scale,
        };
        ctx.fillRect(canvasPoint.x, canvasPoint.y, resolution, resolution);
      }
    } else {
      ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
    }

    const fileName = options.fileName || 'fractal';
    const link = document.createElement('a');
    link.download = generateFileName(fileName, 'png');
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  },

  exportToJPG: (canvas: HTMLCanvasElement, quality: number = 0.95): void => {
    const link = document.createElement('a');
    link.download = generateFileName('fractal', 'jpg');
    link.href = canvas.toDataURL('image/jpeg', quality);
    link.click();
  },

  exportToJPGWithOptions: (canvas: HTMLCanvasElement, options: JPGOptions): void => {
    const exportCanvas = document.createElement('canvas');
    const baseWidth = canvas.width;
    const baseHeight = canvas.height;
    const resolution = 2;

    exportCanvas.width = baseWidth * resolution;
    exportCanvas.height = baseHeight * resolution;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = options.backgroundColor || '#0f172a';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

    const fileName = options.fileName || 'fractal';
    const link = document.createElement('a');
    link.download = generateFileName(fileName, 'jpg');
    link.href = exportCanvas.toDataURL('image/jpeg', options.quality || 0.95);
    link.click();
  },

  captureCanvas: (
    canvas: HTMLCanvasElement,
    points: Point[],
    transform: CanvasTransform,
    color: string,
    backgroundColor: string = '#0f172a',
    resolution: number = 2
  ): string => {
    const exportCanvas = document.createElement('canvas');
    const baseWidth = canvas.width;
    const baseHeight = canvas.height;

    exportCanvas.width = baseWidth * resolution;
    exportCanvas.height = baseHeight * resolution;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    ctx.fillStyle = color;
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const canvasPoint = worldToCanvas(point, {
        ...transform,
        scale: transform.scale * resolution,
        width: exportCanvas.width,
        height: exportCanvas.height,
      });
      ctx.fillRect(canvasPoint.x, canvasPoint.y, resolution, resolution);
    }

    return exportCanvas.toDataURL('image/png');
  },

  getCanvasDimensions: (canvas: HTMLCanvasElement, resolution: number = 1): { width: number; height: number } => {
    return {
      width: canvas.width * resolution,
      height: canvas.height * resolution,
    };
  },
};