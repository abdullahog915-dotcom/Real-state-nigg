'use client';

/* eslint-disable @next/next/no-img-element -- OpenNext serves owner-provided remote URLs unoptimized. */

import { useState, useTransition } from 'react';
import { Loader2, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { Database } from '@/types/database.types';

type Banner = Database['public']['Tables']['homepage_banners']['Row'];
type MediaField =
  | 'desktop_image_url'
  | 'mobile_image_url'
  | 'desktop_video_url'
  | 'mobile_video_url'
  | 'poster_image_url';
type UploadPurpose =
  | 'banner-desktop'
  | 'banner-mobile'
  | 'banner-poster'
  | 'banner-desktop-video'
  | 'banner-mobile-video';
type FormState = {
  media_type: 'image' | 'video';
  title: string;
  subtitle: string;
  desktop_image_url: string;
  mobile_image_url: string;
  desktop_video_url: string;
  mobile_video_url: string;
  poster_image_url: string;
  image_alt: string;
  cta_label: string;
  cta_url: string;
  overlay_strength: string;
  is_active: boolean;
  display_order: string;
};

const EMPTY: FormState = {
  media_type: 'image', title: '', subtitle: '', desktop_image_url: '', mobile_image_url: '',
  desktop_video_url: '', mobile_video_url: '', poster_image_url: '', image_alt: '',
  cta_label: '', cta_url: '', overlay_strength: '45', is_active: false, display_order: '0',
};

const UPLOAD_FIELD: Record<UploadPurpose, MediaField> = {
  'banner-desktop': 'desktop_image_url',
  'banner-mobile': 'mobile_image_url',
  'banner-poster': 'poster_image_url',
  'banner-desktop-video': 'desktop_video_url',
  'banner-mobile-video': 'mobile_video_url',
};

function toForm(row: Banner): FormState {
  return {
    media_type: row.media_type ?? 'image',
    title: row.title,
    subtitle: row.subtitle,
    desktop_image_url: row.desktop_image_url ?? '',
    mobile_image_url: row.mobile_image_url ?? '',
    desktop_video_url: row.desktop_video_url ?? '',
    mobile_video_url: row.mobile_video_url ?? '',
    poster_image_url: row.poster_image_url ?? '',
    image_alt: row.image_alt,
    cta_label: row.cta_label ?? '',
    cta_url: row.cta_url ?? '',
    overlay_strength: String(row.overlay_strength),
    is_active: row.is_active,
    display_order: String(row.display_order),
  };
}

async function deletePendingAsset(path: string) {
  await fetch('/api/admin/site-assets', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
}

function MediaUrlField({
  label, field, purpose, form, uploading, onChange, onUpload,
}: {
  label: string;
  field: MediaField;
  purpose: UploadPurpose;
  form: FormState;
  uploading: UploadPurpose | null;
  onChange: (field: MediaField, value: string) => void;
  onUpload: (file: File, purpose: UploadPurpose) => void;
}) {
  const video = purpose.endsWith('-video');
  return <div className="space-y-2">
    <Label htmlFor={field}>{label}</Label>
    {form[field] && (video
      ? <video className="aspect-video w-full rounded border bg-black object-contain" controls muted playsInline preload="metadata" poster={form.poster_image_url || undefined}><source src={form[field]} type="video/mp4" /></video>
      : <img src={form[field]} alt={`${label} preview`} className="max-h-56 w-full rounded border bg-muted object-contain" />)}
    <div className="flex flex-col gap-2 sm:flex-row">
      <Input id={field} name={field} type="url" value={form[field]} onChange={(event) => onChange(field, event.target.value)} placeholder={video ? 'HTTPS URL ending in .mp4' : 'HTTPS image URL'} />
      <div className="flex gap-2">
        <Button asChild variant="outline" disabled={uploading !== null}>
          <label className="cursor-pointer" htmlFor={`${field}-upload`}><Upload className="h-4 w-4" />{uploading === purpose ? 'Uploading…' : 'Upload'}<input id={`${field}-upload`} name={`${field}_upload`} className="sr-only" type="file" disabled={uploading !== null} accept={video ? 'video/mp4,.mp4' : 'image/jpeg,image/png,image/webp'} onChange={(event) => event.target.files?.[0] && onUpload(event.target.files[0], purpose)} /></label>
        </Button>
        {form[field] && <Button type="button" variant="ghost" onClick={() => onChange(field, '')}><Trash2 className="h-4 w-4" /><span className="sr-only">Remove {label}</span></Button>}
      </div>
    </div>
  </div>;
}

export function BannersManager({ rows, migrationReady }: { rows: Banner[]; migrationReady: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [uploading, setUploading] = useState<UploadPurpose | null>(null);
  const [pendingUploads, setPendingUploads] = useState<Partial<Record<MediaField, string>>>({});
  const [isPending, startTransition] = useTransition();

  const change = (key: keyof FormState, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));
  const openCreate = () => { setEditing(null); setForm(EMPTY); setPendingUploads({}); setOpen(true); };
  const openEdit = (row: Banner) => { setEditing(row); setForm(toForm(row)); setPendingUploads({}); setOpen(true); };

  const closeDialog = (nextOpen: boolean) => {
    if (nextOpen) { setOpen(true); return; }
    const paths = Object.values(pendingUploads);
    setPendingUploads({});
    setOpen(false);
    void Promise.all(paths.map(deletePendingAsset));
  };

  const setMediaType = (mediaType: 'image' | 'video') => {
    setForm((current) => mediaType === 'image'
      ? { ...current, media_type: mediaType, desktop_video_url: '', mobile_video_url: '', poster_image_url: '' }
      : { ...current, media_type: mediaType, desktop_image_url: '', mobile_image_url: '' });
  };

  const upload = async (file: File, purpose: UploadPurpose) => {
    setUploading(purpose);
    const field = UPLOAD_FIELD[purpose];
    try {
      const data = new FormData();
      data.set('file', file);
      data.set('purpose', purpose);
      const response = await fetch('/api/admin/site-assets', { method: 'POST', body: data });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? 'Upload failed');
      const replacedPendingPath = pendingUploads[field];
      if (replacedPendingPath) await deletePendingAsset(replacedPendingPath);
      change(field, body.asset.url);
      setPendingUploads((current) => ({ ...current, [field]: body.asset.storage_path }));
      toast.success('Banner media uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const submit = () => startTransition(async () => {
    const payload = {
      ...form,
      desktop_image_url: form.media_type === 'image' ? form.desktop_image_url : '',
      mobile_image_url: form.media_type === 'image' ? form.mobile_image_url : '',
      desktop_video_url: form.media_type === 'video' ? form.desktop_video_url : '',
      mobile_video_url: form.media_type === 'video' ? form.mobile_video_url : '',
      poster_image_url: form.media_type === 'video' ? form.poster_image_url : '',
      overlay_strength: Number(form.overlay_strength),
      display_order: Number(form.display_order),
    };
    try {
      const response = await fetch(editing ? `/api/admin/banners/${editing.id}` : '/api/admin/banners', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? 'Unable to save banner');

      const unusedPaths = Object.entries(pendingUploads)
        .filter(([field]) => !payload[field as MediaField])
        .map(([, path]) => path);
      await Promise.all(unusedPaths.map(deletePendingAsset));
      setPendingUploads({});
      toast.success(editing ? 'Banner saved' : 'Banner created');
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save banner');
    }
  });

  const remove = (row: Banner) => {
    if (!window.confirm(`Delete “${row.title}”? This cannot be undone.`)) return;
    startTransition(async () => {
      const response = await fetch(`/api/admin/banners/${row.id}`, { method: 'DELETE' });
      const body = await response.json().catch(() => null);
      if (!response.ok) { toast.error(body?.error ?? 'Unable to delete banner'); return; }
      toast.success('Banner deleted');
      router.refresh();
    });
  };

  if (!migrationReady) return <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Migration 022 must be reviewed and applied before this media-aware banner editor can save changes.</CardContent></Card>;

  return <div className="space-y-5">
    <div className="flex justify-end"><Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Banner</Button></div>
    {rows.length === 0 ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No banners yet. The public homepage is using the configured fallback hero.</CardContent></Card> :
      <div className="grid gap-4 lg:grid-cols-2">{rows.map((row) => <Card key={row.id} className="overflow-hidden py-0">
        <div className="relative aspect-[16/7] bg-muted">
          {row.media_type === 'video'
            ? <video className="h-full w-full bg-black object-cover" muted playsInline preload="metadata" poster={row.poster_image_url ?? undefined}><source src={row.desktop_video_url ?? undefined} type="video/mp4" /></video>
            : row.desktop_image_url && <img src={row.desktop_image_url} alt={row.image_alt} className="h-full w-full object-cover" />}
          <div className="absolute right-3 top-3 flex gap-2"><span className="rounded-full bg-background/90 px-2 py-1 text-xs font-medium capitalize">{row.media_type ?? 'image'}</span><span className={`rounded-full px-2 py-1 text-xs font-medium ${row.is_active ? 'bg-emerald-600 text-white' : 'bg-background/90'}`}>{row.is_active ? 'Active' : 'Inactive'}</span></div>
        </div>
        <CardContent className="space-y-3 py-4"><div><h2 className="font-semibold">{row.title}</h2><p className="line-clamp-2 text-sm text-muted-foreground">{row.subtitle}</p></div><div className="flex items-center justify-between text-xs text-muted-foreground"><span>Order {row.display_order}</span><span>Overlay {row.overlay_strength}%</span></div><div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => openEdit(row)}><Pencil className="h-4 w-4" /> Edit</Button><Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(row)}><Trash2 className="h-4 w-4" /> Delete</Button></div></CardContent>
      </Card>)}</div>}

    <Dialog open={open} onOpenChange={closeDialog}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{editing ? 'Edit Banner' : 'Add Banner'}</DialogTitle><DialogDescription>Choose an image banner or a muted MP4 video with an optional mobile version and poster.</DialogDescription></DialogHeader>
      <div className="grid gap-4">
        <div className="space-y-2"><Label htmlFor="banner-media-type">Media Type</Label><Select name="media_type" value={form.media_type} onValueChange={(value) => setMediaType(value as 'image' | 'video')}><SelectTrigger id="banner-media-type" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="image">Image</SelectItem><SelectItem value="video">Video</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="banner-title">Title</Label><Input id="banner-title" name="title" value={form.title} onChange={(event) => change('title', event.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="banner-subtitle">Subtitle</Label><Textarea id="banner-subtitle" name="subtitle" rows={3} value={form.subtitle} onChange={(event) => change('subtitle', event.target.value)} /></div>

        {form.media_type === 'image' ? <>
          <MediaUrlField label="Desktop image" field="desktop_image_url" purpose="banner-desktop" form={form} uploading={uploading} onChange={change} onUpload={upload} />
          <MediaUrlField label="Mobile image (optional)" field="mobile_image_url" purpose="banner-mobile" form={form} uploading={uploading} onChange={change} onUpload={upload} />
          <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP. Maximum 5 MB per image.</p>
        </> : <>
          <MediaUrlField label="Desktop MP4" field="desktop_video_url" purpose="banner-desktop-video" form={form} uploading={uploading} onChange={change} onUpload={upload} />
          <p className="text-xs text-muted-foreground">MP4 only. Maximum 25 MB.</p>
          <MediaUrlField label="Mobile MP4 (optional)" field="mobile_video_url" purpose="banner-mobile-video" form={form} uploading={uploading} onChange={change} onUpload={upload} />
          <p className="text-xs text-muted-foreground">A mobile-specific MP4 avoids downloading the desktop file. Maximum 15 MB.</p>
          <MediaUrlField label="Poster image (optional)" field="poster_image_url" purpose="banner-poster" form={form} uploading={uploading} onChange={change} onUpload={upload} />
          <p className="text-xs text-muted-foreground">Used while loading, after playback errors, and for reduced-motion visitors.</p>
        </>}

        <div className="space-y-2"><Label htmlFor="banner-alt">Media description</Label><Input id="banner-alt" name="image_alt" value={form.image_alt} onChange={(event) => change('image_alt', event.target.value)} /><p className="text-xs text-muted-foreground">The heading and CTA remain real HTML; video itself is treated as decorative.</p></div>
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="cta-label">CTA label</Label><Input id="cta-label" name="cta_label" value={form.cta_label} onChange={(event) => change('cta_label', event.target.value)} /></div><div className="space-y-2"><Label htmlFor="cta-url">CTA destination</Label><Input id="cta-url" name="cta_url" value={form.cta_url} onChange={(event) => change('cta_url', event.target.value)} placeholder="/properties or https://…" /></div></div>
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="overlay">Overlay strength: {form.overlay_strength}%</Label><Input id="overlay" name="overlay_strength" type="range" min="0" max="90" value={form.overlay_strength} onChange={(event) => change('overlay_strength', event.target.value)} /></div><div className="space-y-2"><Label htmlFor="order">Display order</Label><Input id="order" name="display_order" type="number" min="0" max="10000" value={form.display_order} onChange={(event) => change('display_order', event.target.value)} /></div></div>
        <div className="flex items-center justify-between rounded border p-3"><div><Label htmlFor="banner-active">Active</Label><p className="text-xs text-muted-foreground">Only active banners appear publicly.</p></div><Switch id="banner-active" checked={form.is_active} onCheckedChange={(value) => change('is_active', value)} /></div>
      </div><DialogFooter><Button variant="outline" onClick={() => closeDialog(false)}>Cancel</Button><Button onClick={submit} disabled={isPending || uploading !== null}>{isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save Banner</Button></DialogFooter>
    </DialogContent></Dialog>
  </div>;
}
