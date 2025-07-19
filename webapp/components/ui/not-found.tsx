'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileQuestion, Home, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotFoundProps {
  title?: string;
  description?: string;
  showBack?: boolean;
  showHome?: boolean;
  variant?: 'page' | 'section' | 'empty';
  action?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
}

export function NotFound({
  title = "Page not found",
  description = "The page you're looking for doesn't exist or has been moved.",
  showBack = true,
  showHome = true,
  variant = 'page',
  action
}: NotFoundProps) {
  const router = useRouter();

  const content = (
    <div className="flex flex-col items-center justify-center text-center animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
      {variant === 'empty' ? (
        <Search className="h-16 w-16 text-muted-foreground mb-6 animate-pulse" />
      ) : (
        <FileQuestion className="h-16 w-16 text-muted-foreground mb-6 animate-bounce" />
      )}
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {description}
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {showBack && (
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="transition-all hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        )}
        {showHome && (
          <Button 
            asChild
            className="transition-all hover:scale-105"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
        )}
        {action && (
          <Button 
            asChild
            variant="secondary"
            className="transition-all hover:scale-105"
          >
            <Link href={action.href}>
              {action.icon}
              {action.label}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );

  if (variant === 'section') {
    return (
      <Card className="p-8 shadow-lg transition-all hover:shadow-xl">
        {content}
      </Card>
    );
  }

  if (variant === 'empty') {
    return (
      <div className="p-8 bg-muted/50 rounded-lg">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      {content}
    </div>
  );
} 