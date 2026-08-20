'use client';

/* eslint-disable @next/next/no-img-element -- OpenNext serves the owner-managed remote logo unoptimized. */

import Link from 'next/link';
import { Heart, Menu, X, Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { ThemeControl } from '@/components/theme/ThemeControl';
import type { ResolvedSiteSettings } from '@/lib/site-settings';

interface NavbarClientProps {
  /** Email of the signed-in user, or null when signed out. */
  userEmail: string | null;
  settings: ResolvedSiteSettings;
}

export function NavbarClient({ userEmail, settings }: NavbarClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Buy', href: '/properties/buy' },
    { name: 'Rent', href: '/properties/rent' },
    { name: 'Short Let', href: '/properties/short-let' },
    { name: 'Agents', href: '/agents' },
    { name: 'Locations', href: '/locations' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar */}
      <div className="hidden lg:block border-b bg-muted/40">
        <div className="container mx-auto flex h-10 items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            {settings.phone && <a href={`tel:${settings.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="h-4 w-4" />
              <span>{settings.phone}</span>
            </a>}
            {settings.email && <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="h-4 w-4" />
              <span>{settings.email}</span>
            </a>}
          </div>
          <div className="text-muted-foreground">
            {settings.tagline}
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="container mx-auto">
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {settings.logoUrl ? <img src={settings.logoUrl} alt={`${settings.name} logo`} width="128" height="40" className="h-10 w-auto max-w-32 object-contain" /> : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">{settings.logoText}</div>}
            <span className="hidden font-bold text-xl sm:inline-block">
              {settings.name}
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop auth area */}
          <div className="hidden lg:flex lg:items-center lg:gap-3">
            <ThemeControl compact />
            {userEmail ? (
              <>
                <Link
                  href="/favorites"
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary"
                >
                  <Heart className="h-4 w-4" />
                  Favorites
                </Link>
                <span
                  className="max-w-[150px] truncate text-sm text-muted-foreground"
                  title={userEmail}
                >
                  {userEmail}
                </span>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Login
                </Link>
                <Button asChild size="sm">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t py-4">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile auth area */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeControl />
                </div>
                {userEmail ? (
                  <>
                    <p className="truncate text-sm text-muted-foreground" title={userEmail}>
                      {userEmail}
                    </p>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      Favorites
                    </Link>
                    <SignOutButton
                      className="-ml-2"
                      onBeforeSignOut={() => setMobileMenuOpen(false)}
                    />
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block text-sm font-medium transition-colors hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="block text-sm font-medium transition-colors hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>

              {(settings.phone || settings.email) && <div className="pt-4 border-t space-y-2">
                {settings.phone && <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>{settings.phone}</span>
                </a>}
                {settings.email && <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>{settings.email}</span>
                </a>}
              </div>}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
