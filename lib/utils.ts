import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in Nigerian Naira
 */
export function formatPrice(amount: number, type: 'sale' | 'rent' | 'short-let' = 'sale'): string {
  const formatted = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  // Replace NGN with ₦
  const withNairaSymbol = formatted.replace('NGN', '₦');

  // Add suffix for rent/short-let
  if (type === 'rent') {
    return `${withNairaSymbol}/month`;
  } else if (type === 'short-let') {
    return `${withNairaSymbol}/night`;
  }

  return withNairaSymbol;
}

/**
 * Generate slug from string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

/**
 * Generate WhatsApp message URL
 */
export function generateWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

/**
 * Format area (square meters)
 */
export function formatArea(sqm: number): string {
  return `${sqm.toLocaleString()} sqm`;
}

/**
 * Format an ISO date string for display (e.g. "15 Aug 2026")
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get property type label
 */
export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    apartment: 'Apartment',
    duplex: 'Duplex',
    detached: 'Detached House',
    'semi-detached': 'Semi-detached House',
    terrace: 'Terrace',
    penthouse: 'Penthouse',
    villa: 'Villa',
    land: 'Land',
    commercial: 'Commercial Property',
    office: 'Office Space',
    warehouse: 'Warehouse',
    shop: 'Shop',
    hotel: 'Hotel',
    estate: 'Estate',
  };

  return labels[type] || type;
}

/**
 * Get transaction type label
 */
export function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    sale: 'For Sale',
    rent: 'For Rent',
    'short-let': 'Short Let',
  };

  return labels[type] || type;
}
