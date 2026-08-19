'use client';

import { useEffect, useRef, useState } from 'react';
import type { TurnstileAction } from '@/lib/turnstile';

const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      action: TurnstileAction;
      theme: 'auto';
      'response-field': false;
      callback: (token: string) => void;
      'expired-callback': () => void;
      'timeout-callback': () => void;
      'error-callback': () => void;
    }
  ): string;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${TURNSTILE_SCRIPT_URL}"]`
    );
    const script = existing ?? document.createElement('script');

    const handleLoad = () => {
      window.clearTimeout(loadTimeout);
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('Turnstile API was not available after script load.'));
    };
    const handleError = () => {
      window.clearTimeout(loadTimeout);
      reject(new Error('Turnstile script failed to load.'));
    };
    const loadTimeout = window.setTimeout(handleError, 10000);

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    if (!existing) {
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }).catch((error) => {
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
}

export const isTurnstileConfigured = Boolean(
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
);

interface TurnstileWidgetProps {
  action: TurnstileAction;
  onTokenChange: (token: string | null) => void;
  resetKey?: number;
}

export function TurnstileWidget({
  action,
  onTokenChange,
  resetKey = 0,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let disposed = false;
    let widgetId: string | null = null;
    onTokenChange(null);
    setLoadError(false);
    setIsLoading(true);

    loadTurnstile()
      .then((turnstile) => {
        if (disposed || !containerRef.current) return;
        widgetId = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme: 'auto',
          'response-field': false,
          callback: (token) => onTokenChange(token),
          'expired-callback': () => onTokenChange(null),
          'timeout-callback': () => onTokenChange(null),
          'error-callback': () => {
            onTokenChange(null);
            setLoadError(true);
          },
        });
        setIsLoading(false);
      })
      .catch(() => {
        if (!disposed) {
          onTokenChange(null);
          setLoadError(true);
          setIsLoading(false);
        }
      });

    return () => {
      disposed = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [action, onTokenChange, resetKey, siteKey]);

  if (!siteKey) return null;

  return (
    <div className="space-y-2">
      <div ref={containerRef} aria-label="Security verification" />
      {isLoading && (
        <p role="status" className="text-sm text-muted-foreground">
          Loading security check…
        </p>
      )}
      {loadError && (
        <p role="alert" className="text-sm text-destructive">
          The security check is unavailable. Refresh the page and try again.
        </p>
      )}
      <noscript>
        <p className="text-sm text-destructive">
          JavaScript is required to complete the security check.
        </p>
      </noscript>
    </div>
  );
}
