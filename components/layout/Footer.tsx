import Link from 'next/link';
import { Globe, Camera, MessageCircle, Briefcase, Mail, Phone, MapPin } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    properties: [
      { name: 'Buy Property', href: '/properties/buy' },
      { name: 'Rent Property', href: '/properties/rent' },
      { name: 'Short Let', href: '/properties/short-let' },
      { name: 'Featured Properties', href: '/properties?featured=true' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Agents', href: '/agents' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Blog', href: '/blog' },
    ],
    locations: [
      { name: 'Lagos Properties', href: '/locations/lagos' },
      { name: 'Abuja Properties', href: '/locations/abuja' },
      { name: 'Port Harcourt', href: '/locations/port-harcourt' },
      { name: 'All Locations', href: '/locations' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Globe, href: '#' },
    { name: 'Instagram', icon: Camera, href: '#' },
    { name: 'Twitter', icon: MessageCircle, href: '#' },
    { name: 'LinkedIn', icon: Briefcase, href: '#' },
  ];

  return (
    <footer className="bg-muted/40 border-t">
      <div className="container mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12">
          {/* Company info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
                RE
              </div>
              <span className="font-bold text-xl">Real Estate</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Your trusted partner in finding the perfect property in Nigeria.
              We specialize in residential and commercial real estate across Lagos, Abuja, and beyond.
            </p>

            {/* Contact info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">
                  123 Victoria Island, Lagos, Nigeria
                </span>
              </div>
              <a href={`tel:${CONTACT_INFO.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{CONTACT_INFO.phone}</span>
              </a>
              <a href={`mailto:${CONTACT_INFO.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{CONTACT_INFO.email}</span>
              </a>
            </div>
          </div>

          {/* Properties */}
          <div>
            <h3 className="font-semibold mb-4">Properties</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.properties.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h3 className="font-semibold mb-4">Locations</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.locations.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="border-t py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} Real Estate Platform. All rights reserved.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={social.name}
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>

          {/* Legal links */}
          <div className="flex items-center gap-4 text-sm">
            {footerLinks.legal.map((link, index) => (
              <span key={link.name} className="flex items-center gap-4">
                <Link
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
                {index < footerLinks.legal.length - 1 && (
                  <span className="text-muted-foreground">•</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
