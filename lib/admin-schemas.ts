/**
 * Shared validation constants for admin routes and forms.
 *
 * Every value here mirrors a CHECK constraint from the migrations —
 * do not add values that the database does not accept:
 * - property_type / transaction_type / status  → migration 006
 * - inquiry statuses                           → migration 010
 * - viewing request statuses                   → migration 011
 * - contact submission statuses                → migration 012
 * - blog post statuses                         → migration 014
 * - profile roles                              → migration 002
 */
import { z } from 'zod';

export const PROPERTY_TYPES = [
  'apartment',
  'duplex',
  'detached',
  'semi-detached',
  'terrace',
  'penthouse',
  'villa',
  'land',
  'commercial',
  'office',
  'warehouse',
  'shop',
  'hotel',
  'estate',
] as const;

export const TRANSACTION_TYPES = ['sale', 'rent', 'short-let'] as const;

export const PROPERTY_STATUSES = [
  'draft',
  'published',
  'featured',
  'sold',
  'rented',
  'archived',
] as const;

export const INQUIRY_STATUSES = [
  'new',
  'contacted',
  'qualified',
  'negotiation',
  'won',
  'lost',
] as const;

export const VIEWING_REQUEST_STATUSES = [
  'requested',
  'confirmed',
  'completed',
  'cancelled',
] as const;

export const CONTACT_SUBMISSION_STATUSES = ['new', 'read', 'replied', 'archived'] as const;

export const BLOG_POST_STATUSES = ['draft', 'published', 'archived'] as const;

export const PROFILE_ROLES = ['customer', 'agent', 'admin'] as const;

/**
 * One gallery image row for the property form (property_images table,
 * migration 007). The database enforces at most one featured image per
 * property — routes keep only the first flagged image.
 */
export const propertyImageSchema = z.object({
  url: z.string().trim().url('Enter a valid image URL').max(2048),
  alt_text: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal('')),
  display_order: z.number().int().min(0).max(1000).default(0),
  is_featured: z.boolean().default(false),
});

export type PropertyImageInput = z.infer<typeof propertyImageSchema>;

/** Status badge tone used across admin lists and detail dialogs. */
export function statusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'new':
    case 'requested':
      return 'default';
    case 'won':
    case 'completed':
    case 'confirmed':
    case 'replied':
      return 'secondary';
    case 'lost':
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}
