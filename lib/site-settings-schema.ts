import { z } from 'zod';
import { httpUrlSchema } from './admin-schemas.ts';

const optionalHttpUrl = z.union([httpUrlSchema, z.literal('')]);
const phoneSchema = z
  .string()
  .trim()
  .max(40)
  .refine(
    (value) => value === '' || /^[+0-9()\s.-]{7,40}$/.test(value),
    'Enter a valid phone number'
  );

export const brandingSettingsSchema = z.object({
  site_name: z.string().trim().min(2).max(100),
  logo_text: z.string().trim().min(1).max(8),
  site_tagline: z.string().trim().min(2).max(180),
  site_description: z.string().trim().min(20).max(500),
  logo_url: optionalHttpUrl,
  favicon_url: optionalHttpUrl,
});

export const contactSettingsSchema = z.object({
  company_address: z.string().trim().max(300),
  company_email: z.union([z.string().trim().email().max(254), z.literal('')]),
  company_phone: phoneSchema,
  whatsapp_number: phoneSchema,
});

export const homepageSettingsSchema = z.object({
  hero_fallback_title: z.string().trim().min(2).max(140),
  hero_fallback_subtitle: z.string().trim().min(2).max(320),
});

export const seoSettingsSchema = z.object({
  seo_default_description: z.string().trim().min(20).max(320),
  seo_og_image: optionalHttpUrl,
  organization_name: z.string().trim().min(2).max(120),
});

export const socialSettingsSchema = z.object({
  facebook: optionalHttpUrl,
  instagram: optionalHttpUrl,
  twitter: optionalHttpUrl,
  linkedin: optionalHttpUrl,
});

export const siteSettingsRequestSchema = z.discriminatedUnion('section', [
  z.object({ section: z.literal('branding'), values: brandingSettingsSchema }),
  z.object({ section: z.literal('contact'), values: contactSettingsSchema }),
  z.object({ section: z.literal('homepage'), values: homepageSettingsSchema }),
  z.object({ section: z.literal('seo'), values: seoSettingsSchema }),
]);

export const socialSettingsRequestSchema = z.object({ values: socialSettingsSchema });

export const SITE_SETTING_DEFINITIONS = {
  site_name: ['text', 'branding', 'Public site name'],
  logo_text: ['text', 'branding', 'Short text shown when no logo image is configured'],
  site_tagline: ['text', 'branding', 'Short public tagline'],
  site_description: ['text', 'branding', 'Public business description'],
  logo_url: ['text', 'branding', 'Public URL of the main logo image'],
  favicon_url: ['text', 'branding', 'Public URL of the favicon image'],
  company_address: ['text', 'contact', 'Public business address'],
  company_email: ['text', 'contact', 'Public contact email'],
  company_phone: ['text', 'contact', 'Public contact phone'],
  whatsapp_number: ['text', 'contact', 'Public WhatsApp number'],
  hero_fallback_title: ['text', 'homepage', 'Homepage title when no banner is active'],
  hero_fallback_subtitle: ['text', 'homepage', 'Homepage subtitle when no banner is active'],
  seo_default_description: ['text', 'seo', 'Default SEO description'],
  seo_og_image: ['text', 'seo', 'Default Open Graph image URL'],
  organization_name: ['text', 'seo', 'Organization name used in structured data'],
} as const;

export type BrandingSettingsInput = z.infer<typeof brandingSettingsSchema>;
export type ContactSettingsInput = z.infer<typeof contactSettingsSchema>;
export type HomepageSettingsInput = z.infer<typeof homepageSettingsSchema>;
export type SeoSettingsInput = z.infer<typeof seoSettingsSchema>;
export type SocialSettingsInput = z.infer<typeof socialSettingsSchema>;
