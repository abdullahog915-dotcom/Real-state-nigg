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
 * Client-side mirror of the server schema in app/api/contact/route.ts.
 * The server re-validates every submission — this only drives inline UX.
 */
const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(100, 'Name is too long'),
  email: z.string().trim().email('Enter a valid email address').max(255),
  phone: z
    .string()
    .trim()
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  message: z.string().trim().min(10, 'Message is too short').max(2000, 'Message is too long'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  async function onSubmit(values: ContactFormValues) {
    setServerError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(
          result.error || 'Unable to send your message right now. Please try again.'
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
          <h3 className="text-lg font-semibold">Message Sent</h3>
          <p className="text-sm text-muted-foreground">
            Thank you for reaching out. Our team will get back to you shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Send Us a Message</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="contact-name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="contact-name"
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
            <label htmlFor="contact-email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </label>
            <Input
              id="contact-email"
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

          {/* Phone (optional) */}
          <div className="space-y-1.5">
            <label htmlFor="contact-phone" className="text-sm font-medium">
              Phone <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="contact-phone"
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

          {/* Message */}
          <div className="space-y-1.5">
            <label htmlFor="contact-message" className="text-sm font-medium">
              Message <span className="text-destructive">*</span>
            </label>
            <textarea
              id="contact-message"
              rows={5}
              placeholder="How can we help you?"
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
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
