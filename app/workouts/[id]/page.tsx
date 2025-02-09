interface Props {
  params: Promise<{ id: string }>;
}

export default async function WorkoutPage({ params }: Props) {
  const resolvedParams = await params;
  // ... use resolvedParams.id
} 