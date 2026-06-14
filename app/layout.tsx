import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { JumpscareOverlay } from '@/components/jumpscare-overlay';
import { AbyssTerminal } from '@/components/terminal/AbyssTerminal';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Affanverse",
  description: "Welcome to the Affanverse. A minimalist reality blending advanced AI systems with the journey of an anomaly that defies reality itself.",
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
        </ThemeProvider>
        <Footer />
      </body>
    </html>
  );
}