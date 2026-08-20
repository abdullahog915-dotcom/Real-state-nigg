import { z } from 'zod';
import { httpUrlSchema } from './admin-schemas.ts';
import { getSafeRedirectPath } from './redirects.ts';

const nullableText = (max: number) =>
  z.union([z.string().trim().min(2).max(max), z.literal(''), z.null()]).optional();
const nullableHttpUrl = z.union([httpUrlSchema, z.literal(''), z.null()]).optional();

export const mp4UrlSchema = httpUrlSchema.refine((value) => {
  try {
    return new URL(value).pathname.toLowerCase().endsWith('.mp4');
  } catch {
    return false;
  }
}, 'MP4 video URLs must end in .mp4');

const nullableMp4Url = z.union([mp4UrlSchema, z.literal(''), z.null()]).optional();

export function parseBannerCtaUrl(value: string | null | undefined):
  | { kind: 'internal' | 'external'; href: string }
  | null {
  if (!value?.trim()) return null;
  const candidate = value.trim();
  const internal = getSafeRedirectPath(candidate);
  if (internal) return { kind: 'internal', href: internal };

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return { kind: 'external', href: parsed.toString() };
    }
  } catch {
    return null;
  }
  return null;
}

export const bannerInputSchema = z
  .object({
    media_type: z.enum(['image', 'video']).default('image'),
    title: z.string().trim().min(2).max(140),
    subtitle: z.string().trim().min(2).max(320),
    desktop_image_url: nullableHttpUrl,
    mobile_image_url: nullableHttpUrl,
    desktop_video_url: nullableMp4Url,
    mobile_video_url: nullableMp4Url,
    poster_image_url: nullableHttpUrl,
    image_alt: z.string().trim().min(2).max(220),
    cta_label: nullableText(60),
    cta_url: z.union([z.string().trim().max(2048), z.literal(''), z.null()]).optional(),
    overlay_strength: z.number().int().min(0).max(90),
    is_active: z.boolean(),
    display_order: z.number().int().min(0).max(10000),
  })
  .superRefine((value, context) => {
    const desktopImage = value.desktop_image_url?.trim();
    const mobileImage = value.mobile_image_url?.trim();
    const desktopVideo = value.desktop_video_url?.trim();
    const mobileVideo = value.mobile_video_url?.trim();
    const poster = value.poster_image_url?.trim();
    if (value.media_type === 'image') {
      if (!desktopImage) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['desktop_image_url'], message: 'A desktop image is required' });
      }
      if (desktopVideo || mobileVideo || poster) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['media_type'], message: 'Image banners cannot include video or poster media' });
      }
    } else {
      if (!desktopVideo) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['desktop_video_url'], message: 'A desktop MP4 is required' });
      }
      if (desktopImage || mobileImage) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['media_type'], message: 'Video banners cannot include image-banner media' });
      }
    }

    const label = value.cta_label?.trim();
    const url = value.cta_url?.trim();
    if (Boolean(label) !== Boolean(url)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: label ? ['cta_url'] : ['cta_label'],
        message: 'CTA label and destination must be provided together',
      });
    } else if (url && !parseBannerCtaUrl(url)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cta_url'],
        message: 'Use an internal path or an HTTP(S) URL',
      });
    }
  });

export type BannerInput = z.infer<typeof bannerInputSchema>;
