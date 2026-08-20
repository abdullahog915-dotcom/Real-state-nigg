import { NextResponse } from 'next/server';
import { adminApiGuard } from '@/lib/auth';
import {
  SITE_SETTING_DEFINITIONS,
  siteSettingsRequestSchema,
} from '@/lib/site-settings-schema';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: Request) {
  const denied = await adminApiGuard('mutation');
  if (denied) return denied;

  const parsed = siteSettingsRequestSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const rows = Object.entries(parsed.data.values).map(([key, value]) => {
    const definition = SITE_SETTING_DEFINITIONS[key as keyof typeof SITE_SETTING_DEFINITIONS];
    return {
      key,
      value,
      type: definition[0],
      group_name: definition[1],
      description: definition[2],
    };
  });
  const { error } = await (await createClient())
    .from('site_settings')
    .upsert(rows, { onConflict: 'key' });

  if (error) {
    console.error('Admin site settings update failed.', { code: error.code });
    return NextResponse.json({ error: 'Unable to save these settings right now' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
