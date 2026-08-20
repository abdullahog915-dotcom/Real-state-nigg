import { NextResponse } from 'next/server';
import { adminApiGuard } from '@/lib/auth';
import { socialSettingsRequestSchema } from '@/lib/site-settings-schema';
import { createClient } from '@/lib/supabase/server';

const ORDER = { facebook: 10, instagram: 20, twitter: 30, linkedin: 40 } as const;

export async function PUT(request: Request) {
  const denied = await adminApiGuard('mutation');
  if (denied) return denied;

  const parsed = socialSettingsRequestSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  for (const [platform, url] of Object.entries(parsed.data.values)) {
    const { data: existing, error: readError } = await supabase
      .from('social_links')
      .select('id')
      .eq('platform', platform)
      .order('created_at')
      .limit(1)
      .maybeSingle();
    if (readError) {
      console.error('Admin social link lookup failed.', { code: readError.code });
      return NextResponse.json({ error: 'Unable to save social links right now' }, { status: 500 });
    }

    const values = {
      platform: platform as keyof typeof ORDER,
      url,
      // An active blank row intentionally suppresses an environment fallback.
      // Public rendering filters blank URLs, so it never produces a broken link.
      is_active: true,
      display_order: ORDER[platform as keyof typeof ORDER],
    };
    const result = existing
      ? await supabase.from('social_links').update(values).eq('platform', platform)
      : await supabase.from('social_links').insert(values);
    if (result.error) {
      console.error('Admin social link update failed.', { code: result.error.code });
      return NextResponse.json({ error: 'Unable to save social links right now' }, { status: 500 });
    }
  }
  return NextResponse.json({ success: true });
}
