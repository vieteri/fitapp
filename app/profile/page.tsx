"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { ProfileSettings } from '@/components/profile/profile-settings';
import { ProfileWorkouts } from '@/components/profile/profile-workouts';
import { ProfileRoutines } from '@/components/profile/profile-routines';
import { ProfileSettingsSkeleton } from '@/components/profile/profile-settings-skeleton';
import { ProfileWorkoutsSkeleton } from '@/components/profile/profile-workouts-skeleton';
import { ProfileRoutinesSkeleton } from '@/components/profile/profile-routines-skeleton';
import type { Tables } from '@/types/supabase-types';

type Profile = Tables<'profiles'> & { email: string };

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
      return;
    }

    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <ProfileSettingsSkeleton />
        <div className="grid gap-6 md:grid-cols-2">
          <ProfileWorkoutsSkeleton />
          <ProfileRoutinesSkeleton />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <ProfileSettings profile={profile} />
      <div className="grid gap-6 md:grid-cols-2">
        <ProfileWorkouts />
        <ProfileRoutines />
      </div>
    </div>
  );
}