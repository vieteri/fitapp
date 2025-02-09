import { Suspense } from 'react';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import { ProfileSkeleton } from '@/components/profile/profile-skeleton';
import { getProfile } from '@/app/server-actions';

async function ProfileEditWrapper() {
  const profile = await getProfile();
  return <ProfileEditForm initialProfile={profile} />;
}

export default function ProfileEditPage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileEditWrapper />
      </Suspense>
    </div>
  );
} 