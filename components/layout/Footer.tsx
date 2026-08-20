import Link from 'next/link';
/* eslint-disable @next/next/no-img-element -- OpenNext serves the owner-managed remote logo unoptimized. */
import { Globe, Camera, MessageCircle, Briefcase, Mail, Phone, MapPin } from 'lucide-react';
import { getSiteSettings } from '@/lib/site-settings';

export async function Footer() {
  const currentYear = new Date().getFullYear();
  const settings = await getSiteSettings();
  const footerLinks = {
    properties: [{ name: 'Buy Property', href: '/properties/buy' }, { name: 'Rent Property', href: '/properties/rent' }, { name: 'Short Let', href: '/properties/short-let' }, { name: 'All Properties', href: '/properties' }],
    company: [{ name: 'About Us', href: '/about' }, { name: 'Our Agents', href: '/agents' }, { name: 'Contact Us', href: '/contact' }, { name: 'Blog', href: '/blog' }],
    locations: [{ name: 'Lagos Properties', href: '/locations/lagos' }, { name: 'Abuja Properties', href: '/locations/abuja' }, { name: 'Port Harcourt', href: '/locations/port-harcourt' }, { name: 'All Locations', href: '/locations' }],
    legal: [{ name: 'Privacy Policy', href: '/privacy-policy' }, { name: 'Terms of Service', href: '/terms' }],
  };
  const socialLinks = [
    { name: 'Facebook', icon: Globe, href: settings.socials.facebook },
    { name: 'Instagram', icon: Camera, href: settings.socials.instagram },
    { name: 'X / Twitter', icon: MessageCircle, href: settings.socials.twitter },
    { name: 'LinkedIn', icon: Briefcase, href: settings.socials.linkedin },
  ].filter((social) => social.href);

  return <footer className="border-t bg-muted/40"><div className="container mx-auto">
    <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Link href="/" className="mb-4 flex items-center space-x-2">
          {settings.logoUrl ? <img src={settings.logoUrl} alt={`${settings.name} logo`} width="128" height="40" className="h-10 w-auto max-w-32 object-contain" /> : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-xl font-bold text-primary-foreground">{settings.logoText}</div>}
          <span className="text-xl font-bold">{settings.name}</span>
        </Link>
        <p className="mb-4 text-sm text-muted-foreground">{settings.description}</p>
        <div className="space-y-2 text-sm">
          {settings.address && <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /><span className="text-muted-foreground">{settings.address}</span></div>}
          {settings.phone && <a href={`tel:${settings.phone}`} className="flex items-center gap-2 transition-colors hover:text-primary"><Phone className="h-4 w-4 text-muted-foreground" /><span>{settings.phone}</span></a>}
          {settings.email && <a href={`mailto:${settings.email}`} className="flex items-center gap-2 transition-colors hover:text-primary"><Mail className="h-4 w-4 text-muted-foreground" /><span>{settings.email}</span></a>}
        </div>
      </div>
      {(['properties', 'company', 'locations'] as const).map((section) => <div key={section}><h3 className="mb-4 font-semibold">{section[0].toUpperCase() + section.slice(1)}</h3><ul className="space-y-2 text-sm">{footerLinks[section].map((link) => <li key={link.name}><Link href={link.href} className="text-muted-foreground transition-colors hover:text-primary">{link.name}</Link></li>)}</ul></div>)}
    </div>
    <div className="flex flex-col items-center justify-between gap-4 border-t py-6 md:flex-row">
      <p className="text-center text-sm text-muted-foreground md:text-left">© {currentYear} {settings.name}. All rights reserved.</p>
      {socialLinks.length > 0 && <div className="flex items-center gap-4">{socialLinks.map((social) => <a key={social.name} href={social.href} className="text-muted-foreground transition-colors hover:text-primary" aria-label={social.name} target="_blank" rel="noopener noreferrer"><social.icon className="h-5 w-5" /></a>)}</div>}
      <div className="flex items-center gap-4 text-sm">{footerLinks.legal.map((link) => <Link key={link.name} href={link.href} className="text-muted-foreground transition-colors hover:text-primary">{link.name}</Link>)}</div>
    </div>
  </div></footer>;
}
