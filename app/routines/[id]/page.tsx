import { Suspense } from "react";
import { RoutineView } from "@/components/routines/routine-view";
import { RoutineSkeleton } from "@/components/routines/routine-skeleton";
import { getRoutine } from "@/app/server-actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RoutinePage({ params }: Props) {
  const resolvedParams = await params;
  const routine = await getRoutine(resolvedParams.id);

  return (
    <Suspense fallback={<RoutineSkeleton />}>
      <RoutineView routine={routine} />
    </Suspense>
  );
} 