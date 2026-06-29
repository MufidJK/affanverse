import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { JumpscareOverlay } from '@/components/jumpscare-overlay';
import { AbyssTerminal } from '@/components/terminal/AbyssTerminal';

import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://affanverse.vercel.app'),
  title: "Affanverse",
  description: "Welcome to the Affanverse, Ekosistem web interaktif yang menyajikan pengalaman membaca novel Affan: The Apex Predator, penjelajahan map kosmik, hingga mini-game dalam satu universe, Affanverse.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Affanverse",
    title: "Affanverse",
    description: "Welcome to the Affanverse, Ekosistem web interaktif yang menyajikan pengalaman membaca novel Affan: The Apex Predator, penjelajahan map kosmik, hingga mini-game dalam satu universe, Affanverse.",
    locale: "id_ID",
    images: [
      {
        url: "https://res.cloudinary.com/dcsh47583/image/upload/q_auto,f_jpg,w_1200,h_630,c_fill/v1782316260/previewAffanverse2_brdn5e.jpg",
        width: 1200,
        height: 630,
        alt: "Affanverse Preview",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Affanverse",
    description: "Ekosistem web interaktif yang menyajikan pengalaman membaca novel Affan: The Apex Predator, penjelajahan map kosmik, hingga mini-game dalam satu universe, Affanverse.",
    images: ["https://res.cloudinary.com/dcsh47583/image/upload/q_auto,f_jpg,w_1200,h_630,c_fill/v1782316260/previewAffanverse2_brdn5e.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark', 'system', 'glitch']} 
        >
          <Navbar />
          <main className="flex-1 w-full flex flex-col">
            {children}
          </main>
          <JumpscareOverlay />
          <AbyssTerminal />
          <Toaster />
        </ThemeProvider>
        <Footer />
      </body>
    </html>
  );
}