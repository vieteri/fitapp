import { Card } from "@/components/ui/card";
import { RoutinesList } from "@/components/workouts/routines-list";
import { QuickStartSection } from "@/components/workouts/quick-start-section";
import { PageHeader } from "@/components/workouts/page-header";

export default function WorkoutsPage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <PageHeader />

      <div className="space-y-6">
        <QuickStartSection />

        <div>
          <h2 className="text-lg font-semibold mb-4">From Routine</h2>
          <RoutinesList />
        </div>
      </div>
    </div>
  );
}
