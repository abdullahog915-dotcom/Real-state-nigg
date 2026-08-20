'use client';

/* eslint-disable @next/next/no-img-element -- Preview URLs may use any validated HTTP(S) host. */

import { useState, useTransition } from 'react';
import { Loader2, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getManagedSiteAssetPath } from '@/lib/site-asset-storage';
import type { ResolvedSiteSettings } from '@/lib/site-settings';

type Section = 'branding' | 'contact' | 'homepage' | 'seo';
type FormValues = Record<string, string>;

async function jsonRequest(url: string, options: RequestInit) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error ?? 'Something went wrong');
  return body;
}

function Field({
  id,
  label,
  value,
  onChange,
  multiline = false,
  type = 'text',
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <Textarea id={id} name={id} value={value} onChange={(event) => onChange(event.target.value)} rows={3} />
      ) : (
        <Input id={id} name={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SiteSettingsManager({ initial }: { initial: ResolvedSiteSettings }) {
  const [isPending, startTransition] = useTransition();
  const [branding, setBranding] = useState<FormValues>({
    site_name: initial.name,
    logo_text: initial.logoText,
    site_tagline: initial.tagline,
    site_description: initial.description,
    logo_url: initial.logoUrl,
    favicon_url: initial.faviconUrl,
  });
  const [savedBranding, setSavedBranding] = useState(branding);
  const [contact, setContact] = useState<FormValues>({
    company_address: initial.address,
    company_email: initial.email,
    company_phone: initial.phone,
    whatsapp_number: initial.whatsapp,
  });
  const [homepage, setHomepage] = useState<FormValues>({
    hero_fallback_title: initial.heroTitle,
    hero_fallback_subtitle: initial.heroSubtitle,
  });
  const [seo, setSeo] = useState<FormValues>({
    seo_default_description: initial.seoDescription,
    seo_og_image: initial.seoOgImage,
    organization_name: initial.organizationName,
  });
  const [social, setSocial] = useState<FormValues>(initial.socials);
  const [uploading, setUploading] = useState<'logo' | 'favicon' | null>(null);

  const save = (section: Section, values: FormValues) => {
    startTransition(async () => {
      try {
        await jsonRequest('/api/admin/site-settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section, values }),
        });
        if (section === 'branding') {
          for (const key of ['logo_url', 'favicon_url'] as const) {
            const oldPath = getManagedSiteAssetPath(savedBranding[key]);
            if (oldPath && savedBranding[key] !== branding[key]) {
              await fetch('/api/admin/site-assets', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: oldPath }),
              });
            }
          }
          setSavedBranding({ ...branding });
        }
        toast.success('Settings saved');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to save settings');
      }
    });
  };

  const saveSocial = () => {
    startTransition(async () => {
      try {
        await jsonRequest('/api/admin/social-links', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: social }),
        });
        toast.success('Social links saved');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to save social links');
      }
    });
  };

  const upload = async (file: File, purpose: 'logo' | 'favicon') => {
    setUploading(purpose);
    try {
      const data = new FormData();
      data.set('file', file);
      data.set('purpose', purpose);
      const body = await jsonRequest('/api/admin/site-assets', { method: 'POST', body: data });
      setBranding((current) => ({ ...current, [`${purpose}_url`]: body.asset.url }));
      toast.success('Image uploaded. Save Branding to publish it.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const update = (setter: React.Dispatch<React.SetStateAction<FormValues>>, key: string) =>
    (value: string) => setter((current) => ({ ...current, [key]: value }));
  const saveButton = (section: Section, values: FormValues) => (
    <Button onClick={() => save(section, values)} disabled={isPending}>
      {isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save {section[0].toUpperCase() + section.slice(1)}
    </Button>
  );

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Branding</CardTitle><CardDescription>Public identity used in navigation, footer, and metadata.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
            {branding.logo_url ? (
              <img src={branding.logo_url} alt="Current site logo preview" className="h-16 w-32 rounded border bg-white object-contain p-2" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded bg-primary font-bold text-primary-foreground">{branding.logo_text}</div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" disabled={uploading !== null}>
                <label className="cursor-pointer" htmlFor="site-logo-upload"><Upload className="h-4 w-4" />{uploading === 'logo' ? 'Uploading…' : 'Upload logo'}<input id="site-logo-upload" name="site_logo_upload" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && upload(event.target.files[0], 'logo')} /></label>
              </Button>
              {branding.logo_url && <Button variant="ghost" onClick={() => setBranding((current) => ({ ...current, logo_url: '' }))}><Trash2 className="h-4 w-4" /> Remove</Button>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="site-name" label="Site name" value={branding.site_name} onChange={update(setBranding, 'site_name')} />
            <Field id="logo-text" label="Fallback initials" value={branding.logo_text} onChange={update(setBranding, 'logo_text')} hint="Shown when no logo image is configured." />
          </div>
          <Field id="tagline" label="Tagline" value={branding.site_tagline} onChange={update(setBranding, 'site_tagline')} />
          <Field id="description" label="Site description" value={branding.site_description} onChange={update(setBranding, 'site_description')} multiline />
          <Field id="logo-url" label="Logo URL" value={branding.logo_url} onChange={update(setBranding, 'logo_url')} type="url" hint="Upload above or use a trusted HTTPS URL." />
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-0 flex-1"><Field id="favicon-url" label="Favicon URL" value={branding.favicon_url} onChange={update(setBranding, 'favicon_url')} type="url" /></div>
            <Button asChild variant="outline" disabled={uploading !== null}><label className="cursor-pointer" htmlFor="site-favicon-upload">Upload favicon<input id="site-favicon-upload" name="site_favicon_upload" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && upload(event.target.files[0], 'favicon')} /></label></Button>
          </div>
          {saveButton('branding', branding)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contact</CardTitle><CardDescription>Blank optional fields disappear from public pages.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <Field id="address" label="Business address" value={contact.company_address} onChange={update(setContact, 'company_address')} multiline />
          <Field id="email" label="Public email" value={contact.company_email} onChange={update(setContact, 'company_email')} type="email" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="phone" label="Phone" value={contact.company_phone} onChange={update(setContact, 'company_phone')} type="tel" />
            <Field id="whatsapp" label="WhatsApp" value={contact.whatsapp_number} onChange={update(setContact, 'whatsapp_number')} type="tel" hint="Use an international number, for example +234…" />
          </div>
          {saveButton('contact', contact)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Social</CardTitle><CardDescription>Only active, non-blank HTTP(S) links appear publicly.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {(['facebook', 'instagram', 'twitter', 'linkedin'] as const).map((platform) => <Field key={platform} id={`social-${platform}`} label={platform === 'twitter' ? 'X / Twitter' : platform[0].toUpperCase() + platform.slice(1)} value={social[platform]} onChange={update(setSocial, platform)} type="url" />)}
          <Button onClick={saveSocial} disabled={isPending}>Save Social Links</Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Homepage fallback</CardTitle><CardDescription>Used whenever no banner is active.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <Field id="hero-title" label="Hero title" value={homepage.hero_fallback_title} onChange={update(setHomepage, 'hero_fallback_title')} />
            <Field id="hero-subtitle" label="Hero subtitle" value={homepage.hero_fallback_subtitle} onChange={update(setHomepage, 'hero_fallback_subtitle')} multiline />
            {saveButton('homepage', homepage)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>SEO defaults</CardTitle><CardDescription>Route-specific property, location, and article metadata still takes precedence.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <Field id="organization" label="Organization name" value={seo.organization_name} onChange={update(setSeo, 'organization_name')} />
            <Field id="seo-description" label="Default description" value={seo.seo_default_description} onChange={update(setSeo, 'seo_default_description')} multiline />
            <Field id="seo-image" label="Default Open Graph image URL" value={seo.seo_og_image} onChange={update(setSeo, 'seo_og_image')} type="url" />
            {saveButton('seo', seo)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
