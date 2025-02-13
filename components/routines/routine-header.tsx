interface RoutineHeaderProps {
  name: string;
  description: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function RoutineHeader({ name, description, onEdit, onDelete }: RoutineHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 py-2"
        >
          Delete
        </button>
      </div>
    </div>
  );
} 