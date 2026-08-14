'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Client-side mirror of the server schema in app/api/viewing-requests/route.ts.
 * The server re-validates every submission — this only drives inline UX.
 */
const viewingRequestFormSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(100, 'Name is too long'),
  email: z.string().trim().email('Enter a valid email address').max(255),
  phone: z.string().trim().min(7, 'Phone number is too short').max(20, 'Phone number is too long'),
  preferred_date: z.string().min(1, 'Choose a preferred date').regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date'),
  preferred_time: z.string().min(1, 'Choose a preferred time').regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a valid time'),
  message: z
    .string()
    .trim()
    .max(2000, 'Message is too long')
    .optional()
    .or(z.literal('')),
});

type ViewingRequestFormValues = z.infer<typeof viewingRequestFormSchema>;

interface ViewingRequestFormProps {
  propertyId: string;
  propertyTitle: string;
}

/** Today's date in YYYY-MM-DD for the date input's min attribute. */
function getTodayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function ViewingRequestForm({ propertyId, propertyTitle }: ViewingRequestFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ViewingRequestFormValues>({
    resolver: zodResolver(viewingRequestFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      preferred_date: '',
      preferred_time: '',
      message: `Hello, I'd like to schedule a viewing of "${propertyTitle}". Please confirm availability.`,
    },
  });

  async function onSubmit(values: ViewingRequestFormValues) {
    setServerError(null);

    try {
      const response = await fetch('/api/viewing-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, property_id: propertyId }),
      });

      const result = await response.json();

      if (!response.ok) {
        const fieldMessages = result.fieldErrors
          ? Object.values(result.fieldErrors).flat().filter(Boolean)
          : [];
        setServerError(
          fieldMessages[0] || result.error || 'Unable to submit your viewing request right now. Please try again.'
        );
        return;
      }

      setSubmitted(true);
    } catch {
      setServerError('Something went wrong. Please try again.');
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
          <h3 className="text-lg font-semibold">Viewing Request Sent</h3>
          <p className="text-sm text-muted-foreground">
            Thank you. Our team will contact you shortly to confirm your viewing appointment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Request a Viewing</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="viewing-name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="viewing-name"
              autoComplete="name"
              placeholder="Your full name"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="viewing-email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </label>
            <Input
              id="viewing-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label htmlFor="viewing-phone" className="text-sm font-medium">
              Phone <span className="text-destructive">*</span>
            </label>
            <Input
              id="viewing-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+234 800 000 0000"
              aria-invalid={!!errors.phone}
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* Preferred date + time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="viewing-date" className="text-sm font-medium">
                Preferred Date <span className="text-destructive">*</span>
              </label>
              <Input
                id="viewing-date"
                type="date"
                min={getTodayISO()}
                aria-invalid={!!errors.preferred_date}
                {...register('preferred_date')}
              />
              {errors.preferred_date && (
                <p className="text-xs text-destructive">{errors.preferred_date.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="viewing-time" className="text-sm font-medium">
                Preferred Time <span className="text-destructive">*</span>
              </label>
              <Input
                id="viewing-time"
                type="time"
                aria-invalid={!!errors.preferred_time}
                {...register('preferred_time')}
              />
              {errors.preferred_time && (
                <p className="text-xs text-destructive">{errors.preferred_time.message}</p>
              )}
            </div>
          </div>

          {/* Message (optional) */}
          <div className="space-y-1.5">
            <label htmlFor="viewing-message" className="text-sm font-medium">
              Message <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="viewing-message"
              rows={3}
              aria-invalid={!!errors.message}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...register('message')}
            />
            {errors.message && (
              <p className="text-xs text-destructive">{errors.message.message}</p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <p role="alert" className="text-sm text-destructive">
              {serverError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Sending...' : 'Request Viewing'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
