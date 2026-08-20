import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, MapPin, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> { return buildPageMetadata({
  title: 'About Us',
  description:
    'Learn how our Nigerian real estate platform helps people explore properties, locations, and active property agents.',
  path: '/about',
}); }

const features = [
  {
    icon: Search,
    title: 'Focused property search',
    description: 'Browse public listings by transaction type, location, price, and property details.',
  },
  {
    icon: MapPin,
    title: 'Location context',
    description: 'Explore available properties across the Nigerian locations represented on the platform.',
  },
  {
    icon: Users,
    title: 'Direct enquiries',
    description: 'Contact the team or send an enquiry from a listing when you want more information.',
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About Us</h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              We provide a straightforward place to discover residential and commercial
              property opportunities in Nigeria and connect with the people handling them.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardHeader>
                  <Icon className="mb-2 h-6 w-6 text-primary" aria-hidden="true" />
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 rounded-xl border bg-muted/30 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight">Start your search</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Review the latest published listings or contact us if you need help finding
              the right property.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild><Link href="/properties">Browse Properties</Link></Button>
              <Button asChild variant="outline"><Link href="/contact">Contact Us</Link></Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
