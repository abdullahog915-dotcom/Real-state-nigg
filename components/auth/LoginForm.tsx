'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';
import { getSafeRedirectPath } from '@/lib/redirects';
import {
  isTurnstileConfigured,
  TurnstileWidget,
} from '@/components/security/TurnstileWidget';

const loginFormSchema = z.object({
  email: z.string().trim().email('Enter a valid email address').max(255),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginFormProps {
  /** Pre-validated internal redirect path (e.g. `/favorites`). */
  next?: string | null;
}

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const safeNext = getSafeRedirectPath(next);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);

    if (isTurnstileConfigured && !turnstileToken) {
      setServerError('Please complete the security check and try again.');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
        options: turnstileToken ? { captchaToken: turnstileToken } : undefined,
      });

      if (error) {
        // Do not reveal whether the address exists or is awaiting confirmation.
        setServerError('Invalid email or password, or the account is not yet confirmed.');
        setTurnstileToken(null);
        setTurnstileResetKey((value) => value + 1);
        return;
      }

      router.replace(safeNext ?? '/');
      router.refresh();
    } catch {
      setServerError('Something went wrong. Please try again.');
      setTurnstileToken(null);
      setTurnstileResetKey((value) => value + 1);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="text-sm font-medium">
          Email <span className="text-destructive">*</span>
        </label>
        <Input
          id="login-email"
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
        <label htmlFor="login-password" className="text-sm font-medium">
          Password <span className="text-destructive">*</span>
        </label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <TurnstileWidget
        action="login"
        onTokenChange={setTurnstileToken}
        resetKey={turnstileResetKey}
      />

      {/* Server / authentication error */}
      {serverError && (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || (isTurnstileConfigured && !turnstileToken)}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
