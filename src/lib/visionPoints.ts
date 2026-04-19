export type VisionPoint = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  whoBenefits: string[];
  howWeDeliver: string[];
  howToEngage: string[];
  furtherReadLink: string;
};

export const visionPoints: VisionPoint[] = [
  // ... (copy the full array from ../lib/visionPoints.ts)
];

export function findVisionPointBySlug(slug: string): VisionPoint | undefined {
  return visionPoints.find((v) => v.slug === slug);
}
