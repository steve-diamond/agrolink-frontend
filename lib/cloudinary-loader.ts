/**
 * Next.js custom image loader for Cloudinary.
 *
 * Referenced by next.config.mjs → images.loaderFile when
 * NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set.
 *
 * Docs: https://nextjs.org/docs/app/api-reference/components/image#loaderfile
 */

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) return src;

  const q = quality ?? 80;
  const transforms = `f_auto,q_${q},w_${width},c_limit`;

  // For remote URLs use Cloudinary's "fetch" delivery
  const isRemote = src.startsWith("http://") || src.startsWith("https://");
  const base = `https://res.cloudinary.com/${cloud}/image`;
  return isRemote
    ? `${base}/fetch/${transforms}/${src}`
    : `${base}/upload/${transforms}/${src}`;
}
