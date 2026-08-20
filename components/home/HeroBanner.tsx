'use client';

/* eslint-disable @next/next/no-img-element -- picture/poster art direction uses validated owner URLs on OpenNext. */

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Building2, ChevronLeft, ChevronRight, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SearchBar } from '@/components/shared/SearchBar';
import { shouldRenderBannerVideo } from '@/lib/banner-playback';
import type { Database } from '@/types/database.types';

type Banner = Database['public']['Tables']['homepage_banners']['Row'];

function safeCta(value: string | null) {
  if (!value) return null;
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) {
    return { href: value, internal: true };
  }
  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return { href: parsed.toString(), internal: false };
    }
  } catch { return null; }
  return null;
}

function VideoMedia({
  banner,
  shouldPlay,
  loop,
  onEnded,
  onError,
}: {
  banner: Banner;
  shouldPlay: boolean;
  loop: boolean;
  onEnded: () => void;
  onError: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay) {
      void video.play().catch(() => onError());
    } else {
      video.pause();
    }
  }, [onError, shouldPlay]);

  return <video
    ref={videoRef}
    className="absolute inset-0 h-full w-full object-cover object-[center_55%] sm:object-center"
    autoPlay={shouldPlay}
    muted
    playsInline
    loop={loop}
    preload="metadata"
    poster={banner.poster_image_url ?? undefined}
    controls={false}
    aria-hidden="true"
    tabIndex={-1}
    onEnded={onEnded}
    onError={onError}
  >
    {banner.mobile_video_url && <source src={banner.mobile_video_url} type="video/mp4" media="(max-width: 639px)" />}
    {banner.desktop_video_url && <source src={banner.desktop_video_url} type="video/mp4" media={banner.mobile_video_url ? '(min-width: 640px)' : undefined} />}
  </video>;
}

function StaticVideoFallback({ banner }: { banner: Banner }) {
  if (!banner.poster_image_url) return null;
  return <img
    src={banner.poster_image_url}
    alt=""
    width="1920"
    height="760"
    className="absolute inset-0 h-full w-full object-cover object-[center_55%] sm:object-center"
    aria-hidden="true"
  />;
}

export function HeroBanner({
  banners,
  fallbackTitle,
  fallbackSubtitle,
  propertyCount,
  agentCount,
  locationCount,
}: {
  banners: Banner[];
  fallbackTitle: string;
  fallbackSubtitle: string;
  propertyCount: number;
  agentCount: number;
  locationCount: number;
}) {
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [failedVideos, setFailedVideos] = useState<Set<string>>(() => new Set());
  const multiple = banners.length > 1;
  const banner = banners[active];
  const videoFailed = banner ? failedVideos.has(banner.id) : false;
  const videoVisible = shouldRenderBannerVideo({
    mediaType: banner?.media_type,
    reducedMotion,
    failed: videoFailed,
  });
  const paused = hovered || userPaused;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const currentIsTimed = banner?.media_type !== 'video' || videoFailed;
    if (!multiple || paused || reducedMotion || !currentIsTimed) return;
    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % banners.length),
      6000
    );
    return () => window.clearTimeout(timer);
  }, [banner?.media_type, banners.length, multiple, paused, reducedMotion, videoFailed]);

  const select = (index: number) => {
    setActive((index + banners.length) % banners.length);
    setUserPaused(true);
  };
  const advanceAfterVideo = useCallback(() => {
    if (multiple && !paused) setActive((current) => (current + 1) % banners.length);
  }, [banners.length, multiple, paused]);
  const markVideoFailed = useCallback(() => {
    if (!banner) return;
    setFailedVideos((current) => new Set(current).add(banner.id));
  }, [banner]);
  const cta = safeCta(banner?.cta_url ?? null);
  const hasBanner = Boolean(banner);

  return <section
    className={hasBanner ? 'relative isolate w-full overflow-hidden bg-background' : 'relative isolate w-full overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10'}
    aria-roledescription={multiple ? 'carousel' : undefined}
    aria-label={multiple ? 'Featured property promotions' : undefined}
    onMouseEnter={() => multiple && setHovered(true)}
    onMouseLeave={() => multiple && setHovered(false)}
  >
    {banner && <div className="absolute inset-x-0 top-0 h-[340px] overflow-hidden bg-slate-900 sm:inset-0 sm:h-full">
      {banner.media_type === 'video' ? (
        videoVisible
          ? <VideoMedia banner={banner} shouldPlay={!paused} loop={!multiple} onEnded={advanceAfterVideo} onError={markVideoFailed} />
          : <StaticVideoFallback banner={banner} />
      ) : <picture key={banner.id} className="absolute inset-0 block h-full w-full">
        {banner.mobile_image_url && <source media="(max-width: 639px)" srcSet={banner.mobile_image_url} />}
        {banner.desktop_image_url && <img src={banner.desktop_image_url} alt={banner.image_alt} width="1920" height="760" fetchPriority={active === 0 ? 'high' : 'auto'} loading={active === 0 ? 'eager' : 'lazy'} className="absolute inset-0 h-full w-full object-cover object-[center_55%] sm:object-center" />}
      </picture>}
      <div className="absolute inset-0 bg-black" style={{ opacity: banner.overlay_strength / 100 }} aria-hidden="true" />
    </div>}

    <div className={`container relative z-10 mx-auto flex w-full flex-col px-3 min-[390px]:px-4 sm:min-h-[640px] sm:px-4 sm:py-10 lg:h-[clamp(530px,68svh,640px)] lg:min-h-0 lg:py-8 ${hasBanner ? 'min-h-[630px]' : 'min-h-[520px] pt-8'} ${multiple ? 'pb-14 sm:pb-14' : 'pb-7 sm:pb-8'}`}>
      <div className={`mx-auto max-w-4xl text-center ${hasBanner ? 'flex h-[340px] w-full shrink-0 flex-col items-center pt-5 text-white sm:block sm:h-auto sm:pt-0' : ''}`}>
        <Badge variant="secondary" className="mb-2 text-[10px] sm:mb-3 sm:text-xs">{propertyCount > 0 ? `${propertyCount}+ Properties Available` : 'Premium Nigerian Real Estate'}</Badge>
        <h1 className="text-[28px] font-bold leading-[1.1] tracking-tight min-[390px]:text-[30px] sm:text-4xl sm:leading-tight lg:text-5xl">{banner?.title ?? fallbackTitle}</h1>
        <p className={`mx-auto mt-2 max-w-2xl text-xs leading-snug min-[390px]:text-[13px] sm:mt-3 sm:text-base sm:leading-relaxed lg:text-lg ${hasBanner ? 'text-white/90' : 'text-muted-foreground'}`}>{banner?.subtitle ?? fallbackSubtitle}</p>
        {banner?.cta_label && cta && <div className="mt-2.5 sm:mt-5">{cta.internal
          ? <Button asChild size="lg" className="h-9 px-4 text-sm sm:h-11 sm:px-6"><Link href={cta.href}>{banner.cta_label}</Link></Button>
          : <Button asChild size="lg" className="h-9 px-4 text-sm sm:h-11 sm:px-6"><a href={cta.href} target="_blank" rel="noopener noreferrer">{banner.cta_label}</a></Button>}
        </div>}
      </div>
      <div className={`mx-auto w-full max-w-6xl sm:mt-6 lg:mt-6 ${hasBanner ? '-mt-8' : 'mt-5'}`}><SearchBar variant="hero" /></div>
      <div className={`mt-3 grid w-full grid-cols-3 items-center gap-0.5 text-[11px] min-[390px]:text-xs sm:mt-auto sm:flex sm:flex-wrap sm:justify-center sm:gap-6 sm:pt-7 sm:text-sm ${multiple ? 'lg:mb-9' : ''} ${hasBanner ? 'text-foreground sm:text-white/90' : 'text-muted-foreground'}`}>
        <div className="flex items-center justify-center gap-1 whitespace-nowrap sm:gap-2"><Building2 className="h-4 w-4 shrink-0 text-primary" /><span>{propertyCount}+ Properties</span></div><Separator orientation="vertical" className="hidden h-4 sm:block" />
        <div className="flex items-center justify-center gap-1 whitespace-nowrap sm:gap-2"><Users className="h-4 w-4 shrink-0 text-primary" /><span>{agentCount}+ Expert Agents</span></div><Separator orientation="vertical" className="hidden h-4 sm:block" />
        <div className="flex items-center justify-center gap-1 whitespace-nowrap sm:gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary" /><span>{locationCount}+ Locations</span></div>
      </div>
    </div>

    {multiple && <div className="absolute inset-x-0 bottom-3 z-20 flex items-center justify-center gap-2 sm:gap-3">
      <button type="button" className="rounded-full bg-foreground/75 p-1.5 text-background outline-none hover:bg-foreground focus-visible:ring-2 focus-visible:ring-ring sm:bg-black/55 sm:p-2 sm:text-white sm:hover:bg-black/75 sm:focus-visible:ring-white" onClick={() => select(active - 1)} aria-label="Show previous banner"><ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" /></button>
      <div className="flex gap-2" role="tablist" aria-label="Choose banner">{banners.map((item, index) => <button key={item.id} type="button" role="tab" aria-selected={index === active} aria-label={`Show banner ${index + 1}: ${item.title}`} onClick={() => select(index)} className={`h-2.5 rounded-full transition-[width,background-color] motion-reduce:transition-none ${index === active ? 'w-7 bg-foreground sm:bg-white' : 'w-2.5 bg-foreground/40 sm:bg-white/55'}`} />)}</div>
      <button type="button" className="rounded-full bg-foreground/75 p-1.5 text-background outline-none hover:bg-foreground focus-visible:ring-2 focus-visible:ring-ring sm:bg-black/55 sm:p-2 sm:text-white sm:hover:bg-black/75 sm:focus-visible:ring-white" onClick={() => select(active + 1)} aria-label="Show next banner"><ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" /></button>
    </div>}
  </section>;
}
