"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import Link from 'next/link';
import type { Tables } from '@/types/supabase-types';

type Profile = Tables<'profiles'> & { email: string };

export function ProfileSettings({ profile }: { profile: Profile | null }) {
  if (!profile) return null;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{profile.full_name || 'User'}</h1>
          <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
        </div>
        <Link href="/profile/edit">
          <Button variant="outline" size="sm">
            <Settings2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>
    </Card>
  );
} 