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
  authors: [{ name: 'Viet Tran' }],
  openGraph: {
    title: 'FitApp - Your Personal Fitness Companion',
    description: 'Track your workouts, create custom routines, and achieve your fitness goals',
    url: 'https://fitapp.com',
    siteName: 'FitApp',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <Providers>
          <div className="min-h-screen flex flex-col backdrop-blur-sm">
            <Header />
            <main className="flex-1 w-full relative">
              {/* Background decorative elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
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
