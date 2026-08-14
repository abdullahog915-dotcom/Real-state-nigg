import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Mail, MapPin, MessageCircle, Phone, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { getAgentBySlug, getAgentProperties } from '@/lib/supabase/queries';
import { generateWhatsAppUrl, truncate } from '@/lib/utils';

interface AgentDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: AgentDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);

  if (!agent) {
    return { title: 'Agent Not Found' };
  }

  const description = agent.bio
    ? truncate(agent.bio, 160)
    : `${agent.name} is a real estate agent${
        agent.locations && agent.locations.length > 0
          ? ` covering ${agent.locations.join(', ')}`
          : ''
      }. Browse their available property listings.`;

  return {
    title: `${agent.name} | Real Estate Agent`,
    description,
    alternates: {
      canonical: `/agents/${agent.slug}`,
    },
    openGraph: {
      title: `${agent.name} | Real Estate Agent`,
      description,
      ...(agent.photo_url ? { images: [{ url: agent.photo_url }] } : {}),
    },
  };
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);

  if (!agent) {
    notFound();
  }

  const properties = await getAgentProperties(agent.id);
  const whatsappNumber = agent.whatsapp || agent.phone;
  const whatsappUrl = whatsappNumber
    ? generateWhatsAppUrl(
        whatsappNumber,
        `Hello ${agent.name}, I found your profile on your website and would like to discuss property options.`
      )
    : null;

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/agents" className="hover:text-foreground transition-colors">
              Agents
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{agent.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main column */}
          <div className="min-w-0">
            {/* Agent header */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="relative mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-full bg-muted sm:mx-0">
                {agent.photo_url ? (
                  <Image
                    src={agent.photo_url}
                    alt={agent.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <UserRound className="h-12 w-12 text-muted-foreground/60" />
                  </div>
                )}
              </div>

              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{agent.name}</h1>

                {agent.specialization && agent.specialization.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                    {agent.specialization.map((spec: string) => (
                      <Badge key={spec} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                )}

                {agent.locations && agent.locations.length > 0 && (
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{agent.locations.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {agent.bio && (
              <>
                <Separator className="my-8" />
                <h2 className="text-lg font-semibold mb-3">About {agent.name}</h2>
                <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                  {agent.bio}
                </p>
              </>
            )}

            {/* Agent's properties */}
            <Separator className="my-8" />
            <h2 className="text-lg font-semibold mb-1">
              Listings by {agent.name}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {properties.length > 0
                ? `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} currently available`
                : 'No properties currently available'}
            </p>

            {properties.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={
                      property as unknown as Parameters<typeof PropertyCard>[0]['property']
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Listings Yet"
                description={`${agent.name} has no publicly listed properties at the moment. Browse all available properties instead.`}
                icon="home"
                action={{ label: 'Browse Properties', href: '/properties' }}
              />
            )}
          </div>

          {/* Sidebar: contact */}
          <aside>
            <Card className="lg:sticky lg:top-24 gap-0 py-0">
              <CardContent className="space-y-4 pt-6">
                <h2 className="font-semibold">Contact {agent.name}</h2>

                {whatsappUrl && (
                  <Button asChild className="w-full" size="lg">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat on WhatsApp
                    </a>
                  </Button>
                )}

                {agent.phone && (
                  <Button asChild variant="outline" className="w-full" size="lg">
                    <a href={`tel:${agent.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      {agent.phone}
                    </a>
                  </Button>
                )}

                {agent.email && (
                  <Button asChild variant="outline" className="w-full" size="lg">
                    <a href={`mailto:${agent.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </a>
                  </Button>
                )}

                {!whatsappUrl && !agent.phone && !agent.email && (
                  <p className="text-sm text-muted-foreground">
                    Contact details are not available for this agent. Reach out through
                    our contact page instead.
                  </p>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
