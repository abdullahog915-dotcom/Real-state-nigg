import type { Metadata } from 'next';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactForm } from '@/components/forms/ContactForm';
import { CONTACT_INFO } from '@/lib/constants';
import { generateWhatsAppUrl } from '@/lib/utils';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact Us | Get in Touch',
  description:
    'Get in touch with our real estate team. Call, WhatsApp, email, or send us a message — we are happy to help with buying, renting, or short-letting property in Nigeria.',
  path: '/contact',
});

export default function ContactPage() {
  const whatsappUrl = generateWhatsAppUrl(
    CONTACT_INFO.whatsapp,
    'Hello, I would like to speak with your team about a property.'
  );

  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Contact Us
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Have a question about a property or need expert guidance? Reach out through
            any channel below or send us a message directly.
          </p>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
            {/* Contact channels */}
            <div className="space-y-6">
              <Card className="gap-0 py-0">
                <CardHeader>
                  <CardTitle className="text-lg">Reach Us Directly</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="outline" className="w-full justify-start" size="lg">
                    <a href={`tel:${CONTACT_INFO.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      {CONTACT_INFO.phone}
                    </a>
                  </Button>

                  <Button asChild variant="outline" className="w-full justify-start" size="lg">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat on WhatsApp
                    </a>
                  </Button>

                  <Button asChild variant="outline" className="w-full justify-start" size="lg">
                    <a href={`mailto:${CONTACT_INFO.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      {CONTACT_INFO.email}
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="gap-0 py-0">
                <CardHeader>
                  <CardTitle className="text-lg">Office Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex justify-between">
                    <span>Monday – Friday</span>
                    <span className="text-foreground">9:00 AM – 6:00 PM</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Saturday</span>
                    <span className="text-foreground">10:00 AM – 4:00 PM</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-foreground">Closed</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact form */}
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
