# Notes and Rest Timers Feature Guide

## Overview
We've enhanced the fitness app database to support notes and rest timers across different levels of your workouts.

## New Features Added

### 1. Workout Notes
- **Location**: `workouts.notes` column
- **Purpose**: General notes or observations about the entire workout session
- **Use Cases**: 
  - Overall workout feeling ("Great energy today")
  - Equipment used ("Used dumbbells instead of barbell")
  - Environmental notes ("Gym was crowded")

### 2. Exercise Notes (in Workouts)
- **Location**: `workout_exercises.notes` column
- **Purpose**: Notes specific to each exercise within a workout
- **Use Cases**:
  - Form cues ("Keep chest up, back straight")
  - Observations ("Felt stronger on the last set")
  - Modifications ("Used lighter weight due to shoulder")

### 3. Exercise Notes (in Routines/Templates)
- **Location**: `routine_exercises.notes` column
- **Purpose**: Default notes for exercises in routine templates
- **Use Cases**:
  - Standard form reminders
  - Equipment preferences
  - Target muscle group focus

### 4. Rest Timers

#### Between Exercises
- **Location**: `workout_exercises.rest_time_seconds` and `routine_exercises.rest_time_seconds`
- **Purpose**: Rest time after completing all sets of an exercise
- **Default**: 60 seconds
- **Use Cases**:
  - Compound movements (3-5 minutes)
  - Isolation exercises (1-2 minutes)
  - Cardio intervals (30 seconds - 2 minutes)

#### Between Sets
- **Location**: `exercise_sets.rest_time_seconds`
- **Purpose**: Rest time after completing each individual set
- **Default**: 60 seconds
- **Use Cases**:
  - Heavy lifting (2-3 minutes)
  - Hypertrophy training (60-90 seconds)
  - Endurance training (30-60 seconds)

## Implementation Tips

### Database Updates
Run the migration file `supabase/migrations/20250203_add_notes_and_rest_timers.sql` in your Supabase dashboard.

### Frontend Integration
```typescript
// Example: Adding notes to a workout exercise
const workoutExercise = {
  exercise_id: 'uuid',
  workout_id: 'uuid',
  sets: 3,
  reps: 10,
  weight: 135,
  notes: 'Focus on proper form: chest up, back straight, core engaged',
  rest_time_seconds: 90
};

// Example: Adding notes to a workout
const workout = {
  name: 'Push Day',
  description: 'Chest, shoulders, and triceps',
  notes: 'Great workout today! Felt strong and increased weight on bench press',
  user_id: 'uuid'
};
```

### UI Considerations
- Add textarea fields for notes in workout and exercise forms
- Include rest timer inputs with default values
- Consider showing rest timer countdown during workouts
- Display notes in workout history for reference

## Benefits
1. **Better Tracking**: Detailed notes help track progress and form improvements
2. **Consistency**: Rest timers ensure consistent training stimulus
3. **Personalization**: Notes allow for individualized workout adjustments
4. **Progress Monitoring**: Historical notes help identify patterns and improvements 