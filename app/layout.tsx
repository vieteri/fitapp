"use client";

import { GeistSans } from "geist/font/sans";
import { Providers } from "@/components/providers";
import "@/app/globals.css";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

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
