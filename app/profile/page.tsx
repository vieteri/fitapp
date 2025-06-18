import { Suspense } from 'react';
import { ProfileSettings } from '@/components/profile/profile-settings';
import { ProfileWorkouts } from '@/components/profile/profile-workouts';
import { ProfileRoutines } from '@/components/profile/profile-routines';
import { ProfileSkeleton } from '@/components/profile/profile-skeleton';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

// Force dynamic rendering to prevent build issues
export const dynamic = 'force-dynamic';

async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;

  return { ...data, email: user.email };
}

export default async function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Suspense fallback={<ProfileSkeleton type="full" />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}

async function ProfileContent() {
  const profile = await getProfile();
  
  return (
    <>
      <ProfileSettings profile={profile} />
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<ProfileSkeleton type="workouts" />}>
          <ProfileWorkouts />
        </Suspense>
        <Suspense fallback={<ProfileSkeleton type="routines" />}>
          <ProfileRoutines />
        </Suspense>
      </div>
    </>
  );
}