import { NotFound } from "@/components/ui/not-found";

interface EmptyResultsProps {
  query: string;
  type?: string;
}

export function EmptyResults({ query, type = 'results' }: EmptyResultsProps) {
  return (
    <NotFound
      title={`No ${type} found`}
      description={`We couldn't find any ${type} matching "${query}". Try adjusting your search terms.`}
      variant="empty"
      showBack={false}
      showHome={false}
    />
  );
} 