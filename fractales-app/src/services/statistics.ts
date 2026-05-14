import { AffineTransform } from '../types';

export interface FractalStats {
  iterationCount: number;
  generationTimeMs: number;
  pointsPerArea: number;
  mostUsedTransform: number;
  transformUsage: number[];
}

export const statisticsService = {
  calculateDensity: (pointCount: number, bounds: { minX: number; maxX: number; minY: number; maxY: number }): number => {
    const area = (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);
    return area > 0 ? pointCount / area : 0;
  },

  getMostUsedTransform: (usageCounts: number[]): number => {
    let maxIndex = 0;
    let maxCount = 0;
    for (let i = 0; i < usageCounts.length; i++) {
      if (usageCounts[i] > maxCount) {
        maxCount = usageCounts[i];
        maxIndex = i;
      }
    }
    return maxIndex;
  },

  getTransformStats: (transforms: AffineTransform[]): { labels: string[]; probabilities: number[] } => {
    return {
      labels: transforms.map((_, i) => `T${i + 1}`),
      probabilities: transforms.map(t => t.probability * 100),
    };
  },

  calculateStats: (
    iteration: number,
    timeMs: number,
    points: number,
    transformUsage: number[],
    transforms: AffineTransform[]
  ): FractalStats => {
    const canvasArea = 800 * 600;
    const pointsPerArea = points / canvasArea;

    return {
      iterationCount: iteration,
      generationTimeMs: timeMs,
      pointsPerArea: Math.round(pointsPerArea * 1000) / 1000,
      mostUsedTransform: statisticsService.getMostUsedTransform(transformUsage),
      transformUsage: [...transformUsage],
    };
  },
};