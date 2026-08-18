'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

const LEGACY_SYSTEM_THEME_MIGRATION = `
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
        dangerouslySetInnerHTML={{ __html: LEGACY_SYSTEM_THEME_MIGRATION }}
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
