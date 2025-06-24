import { redirect } from "next/navigation";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

/**
 * Determines if an exercise is cardio-based by checking its muscle group
 */
export function isCardioExercise(exercise: { muscle_group?: string | null } | null | undefined): boolean {
  return exercise?.muscle_group?.toLowerCase() === 'cardio';
}

/**
 * Gets the appropriate label for exercise sets based on exercise type
 */
export function getSetLabel(exercise: { muscle_group?: string | null, name?: string } | null | undefined, count: number = 1): string {
  if (isCardioExercise(exercise)) {
    if (isDistanceBasedCardio(exercise?.name || '')) {
      return count === 1 ? 'km' : 'km';
    } else {
      return count === 1 ? 'duration' : 'durations';
    }
  }
  return count === 1 ? 'set' : 'sets';
}

/**
 * Determines if a cardio exercise is distance-based (like running, cycling)
 */
export function isDistanceBasedCardio(exerciseName: string): boolean {
  const distanceKeywords = ['running', 'cycling', 'rowing', 'walking', 'jogging', 'treadmill', 'bike'];
  return distanceKeywords.some(keyword => exerciseName.toLowerCase().includes(keyword));
}
