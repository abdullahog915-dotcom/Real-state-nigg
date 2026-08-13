export const SITE_CONFIG = {
  name: 'Real Estate Agency',
  description: 'Premium real estate platform for Nigerian properties',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
} as const;

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'detached', label: 'Detached House' },
  { value: 'semi-detached', label: 'Semi-detached House' },
  { value: 'terrace', label: 'Terrace' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'villa', label: 'Villa' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial Property' },
  { value: 'office', label: 'Office Space' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'shop', label: 'Shop' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'estate', label: 'Estate' },
] as const;

export const TRANSACTION_TYPES = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
  { value: 'short-let', label: 'Short Let' },
] as const;

export const BEDROOM_OPTIONS = [
  { value: '1', label: '1 Bedroom' },
  { value: '2', label: '2 Bedrooms' },
  { value: '3', label: '3 Bedrooms' },
  { value: '4', label: '4 Bedrooms' },
  { value: '5', label: '5 Bedrooms' },
  { value: '6', label: '6+ Bedrooms' },
] as const;

export const PRICE_RANGES = {
  sale: [
    { min: 0, max: 20000000, label: 'Under ₦20M' },
    { min: 20000000, max: 50000000, label: '₦20M - ₦50M' },
    { min: 50000000, max: 100000000, label: '₦50M - ₦100M' },
    { min: 100000000, max: 200000000, label: '₦100M - ₦200M' },
    { min: 200000000, max: 500000000, label: '₦200M - ₦500M' },
    { min: 500000000, max: Infinity, label: 'Above ₦500M' },
  ],
  rent: [
    { min: 0, max: 500000, label: 'Under ₦500K' },
    { min: 500000, max: 1000000, label: '₦500K - ₦1M' },
    { min: 1000000, max: 2000000, label: '₦1M - ₦2M' },
    { min: 2000000, max: 5000000, label: '₦2M - ₦5M' },
    { min: 5000000, max: 10000000, label: '₦5M - ₦10M' },
    { min: 10000000, max: Infinity, label: 'Above ₦10M' },
  ],
  'short-let': [
    { min: 0, max: 50000, label: 'Under ₦50K' },
    { min: 50000, max: 100000, label: '₦50K - ₦100K' },
    { min: 100000, max: 200000, label: '₦100K - ₦200K' },
    { min: 200000, max: 500000, label: '₦200K - ₦500K' },
    { min: 500000, max: Infinity, label: 'Above ₦500K' },
  ],
} as const;

export const NIGERIAN_CITIES = [
  'Lagos',
  'Abuja',
  'Port Harcourt',
  'Ibadan',
  'Kano',
  'Enugu',
  'Benin City',
  'Calabar',
  'Owerri',
] as const;

export const LAGOS_LOCATIONS = [
  'Lekki',
  'Lekki Phase 1',
  'Lekki Phase 2',
  'Ikoyi',
  'Victoria Island',
  'Banana Island',
  'Ikeja',
  'Ajah',
  'Yaba',
  'Surulere',
  'Chevron',
  'Sangotedo',
  'VGC',
  'Parkview Estate',
] as const;

export const ABUJA_LOCATIONS = [
  'Maitama',
  'Asokoro',
  'Wuse',
  'Wuse 2',
  'Gwarinpa',
  'Jabi',
  'Guzape',
  'Katampe',
  'Lugbe',
  'Lokogoma',
] as const;

export const CONTACT_INFO = {
  phone: process.env.NEXT_PUBLIC_PHONE_NUMBER || '+234-XXX-XXX-XXXX',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '234XXXXXXXXXX',
  email: process.env.NEXT_PUBLIC_EMAIL || 'info@realestate.com',
} as const;
