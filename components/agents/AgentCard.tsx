import Image from 'next/image';
import Link from 'next/link';
import { Phone, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    slug: string;
    photo_url: string | null;
    phone: string | null;
    bio: string | null;
    specialization: string[] | null;
    locations: string[] | null;
  };
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Link href={`/agents/${agent.slug}`} className="group">
      <Card className="text-center gap-0 py-0 transition-shadow hover:shadow-md">
        <CardContent className="pt-6 pb-5">
          {/* Agent photo */}
          <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full bg-muted mb-4">
            {agent.photo_url ? (
              <Image
                src={agent.photo_url}
                alt={agent.name}
                fill
                className="object-cover"
                sizes="96px"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground/60">
                  {agent.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Name */}
          <h3 className="font-semibold text-foreground mb-1">{agent.name}</h3>

          {/* Specialization badges */}
          {agent.specialization && agent.specialization.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mb-3">
              {agent.specialization.slice(0, 2).map((spec) => (
                <Badge key={spec} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          )}

          {/* Locations */}
          {agent.locations && agent.locations.length > 0 && (
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-3">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{agent.locations.join(', ')}</span>
            </div>
          )}

          {/* Bio snippet */}
          {agent.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {agent.bio}
            </p>
          )}

          {/* Phone */}
          {agent.phone && (
            <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>{agent.phone}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
