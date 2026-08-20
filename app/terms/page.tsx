import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> { return buildPageMetadata({
  title: 'Terms of Use',
  description: 'Terms that apply when using this Nigerian real estate platform and its property information.',
  path: '/terms',
}); }

export default function TermsPage() {
  return (
    <article className="container mx-auto max-w-3xl px-4 py-10 lg:py-14">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Use</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: August 19, 2026</p>

      <div className="mt-8 space-y-8 leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">Using the platform</h2>
          <p className="mt-2">
            You may use the platform to browse property information, maintain an account,
            save listings, and contact the team about properties. You must provide accurate
            information, keep your account secure, and avoid unlawful, abusive, or disruptive use.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">Property information</h2>
          <p className="mt-2">
            Listing details, prices, images, and availability can change. Information on this
            website is for general property-search purposes and is not legal, financial, or
            valuation advice. Confirm material details and complete appropriate independent
            checks before entering a transaction.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">Enquiries and viewings</h2>
          <p className="mt-2">
            Submitting a form does not reserve a property or create a sale, lease, or agency
            agreement. A representative must confirm availability, viewing arrangements, and
            any transaction terms separately.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">Accounts and content</h2>
          <p className="mt-2">
            We may restrict access where necessary to protect users or the platform. Website
            content and branding may not be copied or redistributed without permission except
            where applicable law allows it.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">Privacy and contact</h2>
          <p className="mt-2">
            Our <Link href="/privacy-policy" className="font-medium text-primary underline-offset-4 hover:underline">Privacy Policy</Link>{' '}
            explains how personal information is handled. If you have questions about these
            terms, please <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">contact us</Link>.
          </p>
        </section>
      </div>
    </article>
  );
}
