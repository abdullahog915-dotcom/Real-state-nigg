import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getSiteUrl, publicImageUrl } from "@/lib/seo";
import { getSiteSettings } from "@/lib/site-settings";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const socialImage = publicImageUrl(settings.seoOgImage);
  return {
  metadataBase: getSiteUrl(),
  title: { default: settings.name, template: `%s | ${settings.name}` },
  description: settings.seoDescription,
  keywords: [
    "real estate Nigeria",
    "properties for sale Lagos",
    "properties for rent Abuja",
    "Nigerian real estate",
    "buy property Nigeria",
    "rent apartment Lagos",
    "luxury homes Nigeria",
  ],
  authors: [{ name: settings.organizationName }],
  creator: settings.organizationName,
  publisher: settings.organizationName,
  category: "real estate",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: getSiteUrl().toString(),
    siteName: settings.name,
    title: settings.name,
    description: settings.seoDescription,
    ...(socialImage ? { images: [{ url: socialImage, alt: settings.name }] } : {}),
  },
  twitter: {
    card: socialImage ? "summary_large_image" : "summary",
    title: settings.name,
    description: settings.seoDescription,
    ...(socialImage ? { images: [socialImage] } : {}),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  ...(settings.faviconUrl ? { icons: { icon: settings.faviconUrl } } : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The admin dashboard (/admin/*) renders its own shell — no public chrome.
  // The path comes from the x-current-path header set by the middleware.
  const headerList = await headers();
  const isAdminRoute = (headerList.get("x-current-path") ?? "").startsWith("/admin");

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          {!isAdminRoute && <Navbar />}
          <main className="flex-1">{children}</main>
          {!isAdminRoute && <Footer />}
        </ThemeProvider>
      </body>
    </html>
  );
}
