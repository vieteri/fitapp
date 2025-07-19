'use client';

import { withErrorBoundary } from "./with-error-boundary";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Dumbbell, Heart } from "lucide-react";

function FooterContent() {
  return (
    <footer className="w-full border-t border-white/10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FitApp
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <span>© {new Date().getFullYear()} FitApp</span>
            <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <a 
              href="https://supabase.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Powered by Supabase
            </a>
            <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <span className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for fitness
            </span>
          </div>

          {/* Theme Switcher */}
          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  );
}

export const Footer = withErrorBoundary(FooterContent); 