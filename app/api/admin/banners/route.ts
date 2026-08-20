import { NextResponse } from 'next/server';
import { adminApiGuard } from '@/lib/auth';
import { bannerInputSchema } from '@/lib/banner-validation';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const denied = await adminApiGuard('mutation');
  if (denied) return denied;
  const parsed = bannerInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const input = parsed.data;
  const { data, error } = await (await createClient())
    .from('homepage_banners')
    .insert({
      ...input,
      desktop_image_url: input.desktop_image_url || null,
      mobile_image_url: input.mobile_image_url || null,
      desktop_video_url: input.desktop_video_url || null,
      mobile_video_url: input.mobile_video_url || null,
      poster_image_url: input.poster_image_url || null,
      cta_label: input.cta_label || null,
      cta_url: input.cta_url || null,
    })
    .select('id')
    .single();
  if (error) {
    console.error('Banner creation failed.', { code: error.code });
    return NextResponse.json({ error: 'Unable to create this banner right now' }, { status: 500 });
  }
  return NextResponse.json({ success: true, id: data.id }, { status: 201 });
}
