'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export interface AgentFormValues {
  name: string;
  slug: string;
  email: string;
  phone: string;
  whatsapp: string;
  photo_url: string;
  bio: string;
  specialization: string;
  locations: string;
  is_active: boolean;
  display_order: string;
}

export const DEFAULT_AGENT_VALUES: AgentFormValues = {
  name: '',
  slug: '',
  email: '',
  phone: '',
  whatsapp: '',
  photo_url: '',
  bio: '',
  specialization: '',
  locations: '',
  is_active: true,
  display_order: '0',
};

interface AgentFormProps {
  mode: 'create' | 'edit';
  agentId?: string;
  initialValues?: Partial<AgentFormValues>;
}

/** Split a comma-separated input into a clean string array. */
function toList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Admin agent create/edit form. Talks to /api/admin/agents.
 * specialization and locations are comma-separated inputs mapped onto
 * the TEXT[] columns.
 */
export function AgentForm({ mode, agentId, initialValues }: AgentFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<AgentFormValues>({
    ...DEFAULT_AGENT_VALUES,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  const setField = <K extends keyof AgentFormValues>(key: K, value: AgentFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    const clientErrors: Record<string, string[]> = {};
    if (values.name.trim().length < 2) clientErrors.name = ['Name must be at least 2 characters'];

    const displayOrder = Number(values.display_order || '0');
    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      clientErrors.display_order = ['Enter a whole number'];
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      toast.error('Please fix the highlighted fields');
      return;
    }

    setErrors({});

    const payload = {
      name: values.name,
      slug: values.slug,
      email: values.email,
      phone: values.phone,
      whatsapp: values.whatsapp,
      photo_url: values.photo_url,
      bio: values.bio,
      specialization: toList(values.specialization),
      locations: toList(values.locations),
      is_active: values.is_active,
      display_order: displayOrder,
    };

    startTransition(async () => {
      try {
        const response = await fetch(
          mode === 'create' ? '/api/admin/agents' : `/api/admin/agents/${agentId}`,
          {
            method: mode === 'create' ? 'POST' : 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );

        const body = await response.json().catch(() => null);

        if (!response.ok) {
          if (body?.fieldErrors) setErrors(body.fieldErrors);
          throw new Error(body?.error ?? 'Something went wrong');
        }

        toast.success(mode === 'create' ? 'Agent created' : 'Agent saved');
        router.push('/admin/agents');
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Something went wrong');
      }
    });
  };

  const fieldError = (key: string) =>
    errors[key]?.length ? <p className="text-xs text-destructive">{errors[key][0]}</p> : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agent Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(event) => setField('name', event.target.value)}
            />
            {fieldError('name')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={values.slug}
              onChange={(event) => setField('slug', event.target.value)}
              placeholder="Leave empty to generate from name"
            />
            {fieldError('slug')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(event) => setField('email', event.target.value)}
            />
            {fieldError('email')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={values.phone}
              onChange={(event) => setField('phone', event.target.value)}
              placeholder="+234 ..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={values.whatsapp}
              onChange={(event) => setField('whatsapp', event.target.value)}
              placeholder="+234 ..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo_url">Photo URL</Label>
            <Input
              id="photo_url"
              value={values.photo_url}
              onChange={(event) => setField('photo_url', event.target.value)}
              placeholder="https://..."
            />
            {fieldError('photo_url')}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              value={values.bio}
              onChange={(event) => setField('bio', event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specializations</Label>
            <Input
              id="specialization"
              value={values.specialization}
              onChange={(event) => setField('specialization', event.target.value)}
              placeholder="residential, commercial (comma-separated)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locations">Service Locations</Label>
            <Input
              id="locations"
              value={values.locations}
              onChange={(event) => setField('locations', event.target.value)}
              placeholder="Lekki, Ikoyi (comma-separated)"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_active"
              checked={values.is_active}
              onCheckedChange={(checked) => setField('is_active', checked)}
            />
            <Label htmlFor="is_active">Active (visible on the public site)</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              min="0"
              value={values.display_order}
              onChange={(event) => setField('display_order', event.target.value)}
            />
            {fieldError('display_order')}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Agent' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/agents')}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
