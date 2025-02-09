'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tables } from '@/types/supabase-types';

type Profile = Tables<'profiles'> & { email: string };

export function ProfileEditForm({ initialProfile }: { initialProfile: Profile | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  if (!profile) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profile.full_name || ''
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      router.push('/profile');
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={profile.email}
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            value={profile.full_name || ''}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            placeholder="Full Name"
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/profile')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
} 