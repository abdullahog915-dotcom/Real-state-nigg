import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> { return buildPageMetadata({
  title: 'Privacy Policy',
  description: 'How this real estate platform collects, uses, and protects personal information.',
  path: '/privacy-policy',
}); }

export default function PrivacyPolicyPage() {
  return (
    <article className="container mx-auto max-w-3xl px-4 py-10 lg:py-14">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: August 19, 2026</p>

      <div className="mt-8 space-y-8 leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">Information we collect</h2>
          <p className="mt-2">
            We collect information you submit through account registration, contact,
            property enquiry, and viewing-request forms. This can include your name,
            email address, phone number, message, preferred viewing details, and saved
            properties. We also receive basic technical information needed to operate
            and secure the website.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">How we use information</h2>
          <p className="mt-2">
            We use submitted information to provide account features, respond to requests,
            arrange property follow-up, maintain the service, prevent abuse, and meet legal
            obligations. We do not present personal account or enquiry data on public pages.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">Storage and service providers</h2>
          <p className="mt-2">
            The platform uses service providers for hosting, database storage, authentication,
            and media delivery. Those providers process information only as needed to deliver
            their services and under their own security and privacy commitments.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">Your choices</h2>
          <p className="mt-2">
            You may ask to access, correct, or delete personal information associated with
            you, subject to applicable law and necessary record-retention requirements.
            You can also remove saved properties from your account at any time.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">Contact</h2>
          <p className="mt-2">
            For privacy questions or requests, use the details on our{' '}
            <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
              contact page
            </Link>.
          </p>
        </section>
      </div>
    </article>
  );
}
