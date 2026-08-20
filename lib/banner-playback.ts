/** Pure decision helper shared by the hero and focused reduced-motion tests. */
export function shouldRenderBannerVideo({
  mediaType,
  reducedMotion,
  failed,
}: {
  mediaType: 'image' | 'video' | undefined;
  reducedMotion: boolean;
  failed: boolean;
}): boolean {
  return mediaType === 'video' && !reducedMotion && !failed;
}
