'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

const THEME_BOOTSTRAP_COMPATIBILITY = `
// next-themes 0.4.6 can serialize a bundler-injected __name call without its helper.
if (typeof globalThis.__name !== 'function') {
  globalThis.__name = function (target, value) {
    return Object.defineProperty(target, 'name', { value: value, configurable: true });
  };
}
try {
  if (localStorage.getItem('theme') === 'system') {
    localStorage.setItem('theme', 'light');
  }
} catch {}
`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_COMPATIBILITY }}
        suppressHydrationWarning
      />
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        themes={['light', 'dark']}
        storageKey="theme"
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    </>
  );
}
