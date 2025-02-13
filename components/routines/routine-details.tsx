interface RoutineDetailsProps {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export function RoutineDetails({ id, userId, createdAt, updatedAt }: RoutineDetailsProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Routine Details</h2>
        <div className="space-y-2 text-sm">
          <div><span className="font-medium">ID:</span> {id}</div>
          <div><span className="font-medium">User ID:</span> {userId}</div>
          <div><span className="font-medium">Created:</span> {new Date(createdAt).toLocaleString()}</div>
          <div><span className="font-medium">Updated:</span> {new Date(updatedAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
} 