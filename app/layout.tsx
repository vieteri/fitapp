import { Metadata, Viewport } from 'next';
import { GeistSans } from "geist/font/sans";
import { Providers } from "@/components/providers";
import "@/app/globals.css";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'FitApp - Your Personal Fitness Companion',
    template: '%s | FitApp'
  },
  description: 'Track your workouts, create custom routines, and achieve your fitness goals with FitApp',
  keywords: ['fitness', 'workout', 'exercise', 'gym', 'training', 'health'],
  authors: [{ name: 'FitApp Team' }],
  openGraph: {
    title: 'FitApp - Your Personal Fitness Companion',
    description: 'Track your workouts, create custom routines, and achieve your fitness goals',
    url: 'https://fitapp.com',
    siteName: 'FitApp',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitApp - Your Personal Fitness Companion',
    description: 'Track your workouts, create custom routines, and achieve your fitness goals',
  },
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <div className="bg-background text-foreground min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 w-full">
              <div className="container max-w-7xl mx-auto px-6 py-8">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
