import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export async function ProfileExercises() {
  // Add exercise fetching logic here
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">My Exercises</h2>
        <Link href="/exercises">
          <Button variant="ghost" size="sm">View All</Button>
        </Link>
      </div>
      {/* Add exercise list here */}
    </Card>
  );
} 