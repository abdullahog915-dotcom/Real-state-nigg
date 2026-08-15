import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Building2,
  CalendarClock,
  FileEdit,
  Mail,
  MapPin,
  MessageSquare,
  Newspaper,
  Users,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { statusVariant } from '@/lib/admin-schemas';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getAdminDashboardStats,
  getRecentInquiries,
  getRecentViewingRequests,
} from '@/lib/supabase/queries';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Dashboard',
};

interface StatCardConfig {
  label: string;
  value: number;
  icon: typeof Building2;
  href: string;
  hint?: string;
}

export default async function AdminDashboardPage() {
  const [stats, recentInquiries, recentViewings] = await Promise.all([
    getAdminDashboardStats(),
    getRecentInquiries(5),
    getRecentViewingRequests(5),
  ]);

  const statCards: StatCardConfig[] = [
    {
      label: 'Published Properties',
      value: stats.publishedProperties,
      icon: Building2,
      href: '/admin/properties?status=published',
    },
    {
      label: 'Draft Properties',
      value: stats.draftProperties,
      icon: FileEdit,
      href: '/admin/properties?status=draft',
    },
    { label: 'Active Agents', value: stats.activeAgents, icon: Users, href: '/admin/agents' },
    { label: 'Locations', value: stats.locations, icon: MapPin, href: '/admin/locations' },
    {
      label: 'New Inquiries',
      value: stats.newInquiries,
      icon: MessageSquare,
      href: '/admin/inquiries?status=new',
    },
    {
      label: 'Pending Viewings',
      value: stats.pendingViewingRequests,
      icon: CalendarClock,
      href: '/admin/viewing-requests?status=requested',
    },
    {
      label: 'New Contact Messages',
      value: stats.newContactSubmissions,
      icon: Mail,
      href: '/admin/contact-submissions?status=new',
    },
    {
      label: 'Published Blog Posts',
      value: stats.publishedBlogPosts,
      icon: Newspaper,
      href: '/admin/blog',
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Live overview of the platform. All figures come from real database queries."
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/40">
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-3xl font-bold">{card.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Registered users: <span className="font-medium text-foreground">{stats.registeredUsers}</span>
      </p>

      {/* Recent activity */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent Inquiries</CardTitle>
            <Link
              href="/admin/inquiries"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentInquiries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No inquiries yet.</p>
            ) : (
              <ul className="divide-y">
                {recentInquiries.map((inquiry) => {
                  const property = Array.isArray(inquiry.properties)
                    ? inquiry.properties[0]
                    : inquiry.properties;
                  return (
                    <li key={inquiry.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{inquiry.name}</p>
                        {property && (
                          <p className="truncate text-xs text-muted-foreground">
                            {property.title}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant={statusVariant(inquiry.status)}>{inquiry.status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(inquiry.created_at)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent Viewing Requests</CardTitle>
            <Link
              href="/admin/viewing-requests"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentViewings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No viewing requests yet.</p>
            ) : (
              <ul className="divide-y">
                {recentViewings.map((request) => {
                  const property = Array.isArray(request.properties)
                    ? request.properties[0]
                    : request.properties;
                  return (
                    <li key={request.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{request.name}</p>
                        {property && (
                          <p className="truncate text-xs text-muted-foreground">
                            {property.title}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant={statusVariant(request.status)}>{request.status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(request.preferred_date)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
