'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';
import { getSafeRedirectPath } from '@/lib/redirects';
import { SITE_CONFIG } from '@/lib/constants';

const signupFormSchema = z
  .object({
    email: z.string().trim().email('Enter a valid email address').max(255),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupFormSchema>;

interface SignupFormProps {
  /** Pre-validated internal redirect path (e.g. `/favorites`). */
  next?: string | null;
}

export function SignupForm({ next }: SignupFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const safeNext = getSafeRedirectPath(next);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: SignupFormValues) {
    setServerError(null);

    try {
      const emailRedirectTo = `${SITE_CONFIG.url}/auth/callback${
        safeNext ? `?next=${encodeURIComponent(safeNext)}` : ''
      }`;

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { emailRedirectTo },
      });

      if (error) {
        const message = error.message.toLowerCase();
        if (message.includes('already registered') || message.includes('already exists')) {
          setServerError('An account with this email already exists. Try signing in.');
        } else if (message.includes('password')) {
          setServerError('That password is too weak. Please choose a stronger one.');
        } else {
          setServerError('Unable to create your account right now. Please try again.');
        }
        return;
      }

      // Supabase returns a user without identities when the email is already
      // registered — treat it the same as a duplicate account.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setServerError('An account with this email already exists. Try signing in.');
        return;
      }

      // Session returned immediately — email confirmation is disabled.
      if (data.session) {
        router.replace(safeNext ?? '/');
        router.refresh();
        return;
      }

      // No session — the user must confirm their email first.
      setSubmittedEmail(values.email);
      setConfirmationSent(true);
    } catch {
      setServerError('Something went wrong. Please try again.');
    }
  }

  if (confirmationSent) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
        <h3 className="text-lg font-semibold">Check Your Email</h3>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a confirmation link to{' '}
          <span className="font-medium text-foreground">{submittedEmail}</span>. Click the
          link in the email to activate your account, then sign in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="signup-email" className="text-sm font-medium">
          Email <span className="text-destructive">*</span>
        </label>
        <Input
          id="signup-email"
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

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="signup-password" className="text-sm font-medium">
          Password <span className="text-destructive">*</span>
        </label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <label htmlFor="signup-confirm-password" className="text-sm font-medium">
          Confirm Password <span className="text-destructive">*</span>
        </label>
        <Input
          id="signup-confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          aria-invalid={!!errors.confirmPassword}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Server / authentication error */}
      {serverError && (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
}
