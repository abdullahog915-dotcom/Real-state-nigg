import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AgentCard } from '@/components/agents/AgentCard';
import { AgentSearch } from '@/components/agents/AgentSearch';
import { EmptyState } from '@/components/shared/EmptyState';
import { getAgents } from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: 'Our Agents | Meet Our Real Estate Team',
  description:
    'Meet our team of experienced real estate agents across Lagos, Abuja, and Port Harcourt. Find the right agent to help you buy, rent, or short-let property in Nigeria.',
  alternates: {
    canonical: '/agents',
  },
};

interface AgentsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AgentsPage({ searchParams }: AgentsPageProps) {
  const params = await searchParams;
  const keyword = params.q?.trim() || undefined;

  const agents = await getAgents(keyword);

  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Meet Our Agents
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Our experienced team covers Nigeria&apos;s most desirable locations. Find the
            right agent to guide your next property decision.
          </p>

          <div className="mt-4 text-sm text-muted-foreground">
            {agents.length > 0 ? (
              <p>
                <span className="font-semibold text-foreground">{agents.length}</span>{' '}
                {agents.length === 1 ? 'agent' : 'agents'}
                {keyword ? ` matching "${keyword}"` : ' available'}
              </p>
            ) : (
              <p>{keyword ? `No agents matching "${keyword}"` : 'No agents listed yet'}</p>
            )}
          </div>

          <div className="mt-6">
            <Suspense>
              <AgentSearch />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Agent grid */}
      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          {agents.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={keyword ? 'No Agents Found' : 'No Agents Listed Yet'}
              description={
                keyword
                  ? 'No agents match your search. Try a different name.'
                  : 'Our agent profiles are being prepared. Please check back soon or contact us directly.'
              }
              icon="search"
              action={
                keyword
                  ? { label: 'Clear Search', href: '/agents' }
                  : { label: 'Contact Us', href: '/contact' }
              }
            />
          )}
        </div>
      </section>
    </>
  );
}
