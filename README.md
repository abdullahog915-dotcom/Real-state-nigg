# Nigerian Real Estate Platform

A premium, production-ready real estate platform designed specifically for Nigerian real estate agencies. Built with Next.js, TypeScript, Supabase, and optimized for Cloudflare deployment.

## 🎯 Project Overview

This is a commercial-grade real estate platform that can be sold to Nigerian real estate agencies for approximately **$500–$1,000**. The platform provides a complete solution for property management, lead generation, and customer engagement.

### Key Features

- 🏢 **Property Management** - Full CRUD for properties with advanced search and filtering
- 👥 **Agent Management** - Agent profiles, property assignments, and lead tracking
- 📊 **Lead Management** - Inquiry tracking, viewing requests, and customer relationship management
- 💬 **WhatsApp Integration** - Direct WhatsApp communication for instant customer engagement
- 📱 **Mobile-First Design** - Fully responsive, optimized for Nigerian mobile users
- 🔒 **Secure Authentication** - Supabase Auth with role-based access control
- 📝 **Blog/CMS** - SEO-optimized content management system
- 🌍 **Location-Based** - Nigerian cities and neighborhoods (Lagos, Abuja, Port Harcourt)
- 💰 **NGN Currency** - Nigerian Naira (₦) with proper formatting
- ⚡ **Fast & SEO-Optimized** - Built for Core Web Vitals and search engine visibility

## 🛠️ Technology Stack

### Frontend
- **Next.js 16.3.0** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Lucide Icons** - Beautiful icon system

### Backend
- **Supabase** - PostgreSQL database + Authentication + Storage
- **Row Level Security (RLS)** - Database-level authorization
- **Supabase Storage** - Image and file management

### Forms & Validation
- **React Hook Form** - Performant form management
- **Zod** - TypeScript-first schema validation

### Deployment
- **Cloudflare Pages** - Global CDN and hosting
- **Cloudflare Workers** - Serverless runtime
- **Cloudflare DNS & SSL** - Domain and security management

## 📋 Project Status

### ✅ Completed Phases

- **Phase 1** - Architecture & Planning
  - Complete database schema (15 tables)
  - RLS security strategy
  - Component architecture
  - Deployment architecture

- **Phase 2** - Foundation (Current)
  - Next.js setup with App Router
  - TypeScript configuration (strict mode)
  - Tailwind CSS with design tokens
  - Project folder structure
  - Layout components (Navbar, Footer)
  - Utility functions and constants
  - Cloudflare compatibility

### 🚧 Pending Phases

- **Phase 3** - Supabase Backend
- **Phase 4** - Public Website
- **Phase 5** - Conversion Features
- **Phase 6** - Admin Dashboard
- **Phase 7** - SEO & Performance
- **Phase 8** - Security Review
- **Phase 9** - Cloudflare Production

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn
- Supabase account (free tier available)
- Cloudflare account (for production deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nigerian-real-estate-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Update `.env.local` with your credentials**
   - Supabase project URL and keys
   - Site URL
   - WhatsApp number
   - Contact information
   - Analytics IDs (optional)

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
nigerian-real-estate-platform/
├── app/                          # Next.js App Router
│   ├── (public)/                # Public routes
│   │   ├── properties/
│   │   ├── agents/
│   │   ├── blog/
│   │   └── ...
│   ├── (admin)/                 # Admin routes
│   │   └── admin/
│   ├── api/                     # API routes
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── layout/                  # Navbar, Footer
│   ├── properties/              # Property components
│   ├── agents/                  # Agent components
│   ├── forms/                   # Form components
│   ├── admin/                   # Admin components
│   └── shared/                  # Shared components
├── lib/                         # Utility functions
│   ├── supabase/                # Supabase clients
│   ├── utils.ts                 # Helper functions
│   └── constants.ts             # App constants
├── types/                       # TypeScript types
├── hooks/                       # React hooks
├── supabase/                    # Supabase migrations & seeds
│   └── migrations/
├── docs/                        # Documentation
│   ├── PROJECT_STATUS.md        # Current project status
│   ├── ARCHITECTURE.md          # System architecture
│   └── CHANGELOG.md             # Change history
├── public/                      # Static assets
├── .env.example                 # Environment variables template
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
```

## 🗄️ Database Schema

The platform uses PostgreSQL via Supabase with 15 tables:

- **profiles** - User profiles with roles
- **agents** - Real estate agent information
- **properties** - Property listings
- **property_images** - Property photo gallery
- **amenities** - Available amenities
- **property_amenities** - Property-amenity relationships
- **locations** - Nigerian cities and neighborhoods
- **favorites** - User saved properties
- **inquiries** - Customer inquiries and leads
- **viewing_requests** - Property viewing appointments
- **blog_posts** - Blog articles
- **blog_categories** - Blog categories
- **contact_submissions** - Contact form submissions
- **site_settings** - Configurable site settings
- **social_links** - Social media links

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete schema details.

## 🔒 Security

- **Row Level Security (RLS)** - All tables protected with PostgreSQL RLS
- **Role-Based Access** - Customer, Agent, and Admin roles
- **Environment Variables** - Secrets never committed to repository
- **Authentication** - Supabase Auth with JWT tokens
- **File Upload Security** - MIME type and size validation
- **Admin Route Protection** - Middleware-level authorization

## 🌍 Nigerian Market Localization

- **Currency**: Nigerian Naira (₦) with proper formatting
- **Locations**: Lagos, Abuja, Port Harcourt, and more
- **Popular Areas**: Lekki, Ikoyi, Victoria Island, Maitama, Asokoro
- **Property Types**: Duplex, BQ (Boys' Quarters), Estate, etc.
- **Amenities**: Generator, Borehole, Security, CCTV, Gated Estate
- **Communication**: WhatsApp-first approach

## 📱 WhatsApp Integration

Property inquiries and viewing requests include WhatsApp integration:

```typescript
// Generate WhatsApp URL with pre-filled message
const message = `Hello, I'm interested in ${property.title}. I found it on your website.`;
const whatsappUrl = generateWhatsAppUrl(WHATSAPP_NUMBER, message);
```

## 🎨 Design System

### Colors
- **Primary**: Green (#22c55e) - Trust and growth
- **Background**: White/Dark slate
- **Text**: Slate gray
- **Accents**: Neutral grays

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Semibold, tight tracking
- **Body**: Regular, comfortable line height

### Spacing
- **Container Padding**: 4/6/8 (mobile/tablet/desktop)
- **Section Padding**: 12/16/20 (mobile/tablet/desktop)

## 🚀 Deployment

### Cloudflare Pages

1. **Connect GitHub Repository**
   - Login to Cloudflare Dashboard
   - Navigate to Pages
   - Connect your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Build output: `.next`
   - Environment variables: Add all from `.env.example`

3. **Deploy**
   - Automatic deployment on git push to main
   - Preview deployments for branches

4. **Custom Domain**
   - Add custom domain in Cloudflare
   - Update DNS records
   - SSL automatically provisioned

See [Cloudflare Next.js documentation](https://developers.cloudflare.com/pages/framework-guides/nextjs/) for details.

## 📊 Performance Targets

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

This is a commercial product. For customization or white-labeling inquiries, contact the development team.

## 📄 License

Proprietary - This is commercial software.

## 🔗 Important Links

- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Current development status
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete system architecture
- [CHANGELOG.md](./CHANGELOG.md) - Project history
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Pages](https://pages.cloudflare.com/)

## 💡 Configuration

### For New Client Deployment

When deploying for a new real estate agency:

1. Update `.env.local` with client-specific values
2. Configure site settings in admin panel
3. Upload client logo and branding
4. Seed initial data (locations, amenities)
5. Add client's properties and agents
6. Connect custom domain
7. Configure analytics (Google Analytics, Meta Pixel)

### Reusability

The platform is designed to be reused for multiple clients:
- Configurable site settings (name, logo, contact info)
- Data-driven content (properties, agents, locations)
- White-label ready
- Multi-tenancy capable (future enhancement)

## 🐛 Troubleshooting

### Build Issues

- Ensure Node.js version is 18+ or 20+
- Clear `.next` folder and `node_modules`, reinstall dependencies
- Check environment variables are properly set

### Supabase Connection Issues

- Verify Supabase URL and keys in `.env.local`
- Check Supabase project is active
- Ensure RLS policies are properly configured

### Cloudflare Deployment Issues

- Verify Next.js config is Cloudflare-compatible
- Check environment variables in Cloudflare dashboard
- Review build logs for errors

## 📞 Support

For technical support or customization requests, contact the development team.

---

**Built with ❤️ for Nigerian Real Estate**
