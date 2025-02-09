import { ThemeSwitcher } from "@/components/theme-switcher";

export function Footer() {
  return (
    <footer className="w-full border-t border-t-foreground/10">
      <div className="container max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2 text-sm text-foreground/60">
            <span>© {new Date().getFullYear()} FitTrack</span>
            <span>·</span>
            <a 
              href="https://supabase.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Powered by Supabase
            </a>
          </div>
          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  );
} 