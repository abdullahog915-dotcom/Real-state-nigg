'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  CalendarClock,
  ExternalLink,
  FolderOpen,
  LayoutDashboard,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Newspaper,
  ImageIcon,
  Settings,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeControl } from '@/components/theme/ThemeControl';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/properties', label: 'Properties', icon: Building2 },
  { href: '/admin/agents', label: 'Agents', icon: Users },
  { href: '/admin/locations', label: 'Locations', icon: MapPin },
  { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
  { href: '/admin/viewing-requests', label: 'Viewing Requests', icon: CalendarClock },
  { href: '/admin/contact-submissions', label: 'Contacts', icon: Mail },
  { href: '/admin/blog', label: 'Blog', icon: Newspaper },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings },
  { href: '/admin/users', label: 'Users', icon: UserCog },
] as const;

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Admin navigation shell: fixed sidebar on desktop, slide-over panel on
 * mobile. Highlights the current section from the actual pathname.
 */
export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="space-y-1 border-t px-3 py-4">
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-muted-foreground">
        <span>Theme</span>
        <ThemeControl compact />
      </div>
      <Link
        href="/"
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ExternalLink className="h-4 w-4" />
        View Website
      </Link>
      <SignOutButton className="w-full justify-start px-3 text-muted-foreground hover:bg-muted hover:text-foreground" />
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
        <span className="text-sm font-semibold">Admin Dashboard</span>
        <div className="flex items-center gap-2">
          <ThemeControl compact />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile slide-over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-background shadow-xl">
            <div className="flex h-14 items-center border-b px-4 text-sm font-semibold">
              Admin Dashboard
            </div>
            {nav}
            {footer}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-background lg:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/admin" className="text-sm font-semibold">
            Admin Dashboard
          </Link>
        </div>
        {nav}
        {footer}
      </aside>
    </>
  );
}
