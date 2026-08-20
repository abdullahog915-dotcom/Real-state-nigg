import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminApiGuard } from '@/lib/auth';
import { bannerInputSchema } from '@/lib/banner-validation';
import { getManagedSiteAssetPath, SITE_ASSET_BUCKET } from '@/lib/site-asset-storage';
import { createClient } from '@/lib/supabase/server';

const idSchema = z.string().uuid();
type Context = { params: Promise<{ id: string }> };

async function removeReplacedAssets(
  oldUrls: Array<string | null>,
  retainedUrls: Array<string | null>
) {
  const candidates = oldUrls
    .filter((url): url is string => Boolean(url) && !retainedUrls.includes(url))
    .map((url) => ({ url, path: getManagedSiteAssetPath(url) }))
    .filter((item): item is { url: string; path: string } => Boolean(item.path));
  if (candidates.length === 0) return;

  const supabase = await createClient();
  const removable: string[] = [];
  for (const candidate of candidates) {
    const [settings, banners] = await Promise.all([
      supabase.from('site_settings').select('id').eq('value', candidate.url).limit(1),
      supabase.from('homepage_banners').select('id').or(
        `desktop_image_url.eq.${candidate.url},mobile_image_url.eq.${candidate.url},desktop_video_url.eq.${candidate.url},mobile_video_url.eq.${candidate.url},poster_image_url.eq.${candidate.url}`
      ).limit(1),
    ]);
    if (!settings.error && !banners.error && !settings.data?.length && !banners.data?.length) {
      removable.push(candidate.path);
    }
  }
  if (removable.length > 0) {
    const { error } = await supabase.storage.from(SITE_ASSET_BUCKET).remove(removable);
    if (error) console.error('Replaced banner asset cleanup failed.', { count: removable.length });
  }
}

export async function PATCH(request: Request, context: Context) {
  const denied = await adminApiGuard('mutation');
  if (denied) return denied;
  const id = (await context.params).id;
  const parsedId = idSchema.safeParse(id);
  const parsed = bannerInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsedId.success || !parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', fieldErrors: parsed.success ? {} : parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from('homepage_banners')
    .select('desktop_image_url, mobile_image_url, desktop_video_url, mobile_video_url, poster_image_url')
    .eq('id', id)
    .maybeSingle();
  if (currentError || !current) return NextResponse.json({ error: 'Banner not found' }, { status: 404 });

  const input = parsed.data;
  const next = {
    ...input,
    desktop_image_url: input.desktop_image_url || null,
    mobile_image_url: input.mobile_image_url || null,
    desktop_video_url: input.desktop_video_url || null,
    mobile_video_url: input.mobile_video_url || null,
    poster_image_url: input.poster_image_url || null,
    cta_label: input.cta_label || null,
    cta_url: input.cta_url || null,
  };
  const { error } = await supabase.from('homepage_banners').update(next).eq('id', id);
  if (error) return NextResponse.json({ error: 'Unable to save this banner right now' }, { status: 500 });

  await removeReplacedAssets(
    [current.desktop_image_url, current.mobile_image_url, current.desktop_video_url, current.mobile_video_url, current.poster_image_url],
    [next.desktop_image_url, next.mobile_image_url, next.desktop_video_url, next.mobile_video_url, next.poster_image_url]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, context: Context) {
  const denied = await adminApiGuard('mutation');
  if (denied) return denied;
  const id = (await context.params).id;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: 'Invalid banner id' }, { status: 400 });

  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from('homepage_banners')
    .select('desktop_image_url, mobile_image_url, desktop_video_url, mobile_video_url, poster_image_url')
    .eq('id', id)
    .maybeSingle();
  if (currentError || !current) return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
  const { error } = await supabase.from('homepage_banners').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Unable to delete this banner right now' }, { status: 500 });
  await removeReplacedAssets([
    current.desktop_image_url,
    current.mobile_image_url,
    current.desktop_video_url,
    current.mobile_video_url,
    current.poster_image_url,
  ], []);
  return NextResponse.json({ success: true });
}
