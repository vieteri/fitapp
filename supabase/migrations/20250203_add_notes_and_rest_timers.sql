-- Add notes and rest timer functionality to fitness app
-- Migration: 20250203_add_notes_and_rest_timers.sql

-- Add notes column to workouts table (separate from description)
ALTER TABLE workouts 
ADD COLUMN notes TEXT;

-- Add notes and rest timer to workout_exercises table
ALTER TABLE workout_exercises 
ADD COLUMN notes TEXT,
ADD COLUMN rest_time_seconds INTEGER DEFAULT 60;

-- Add rest timer to exercise_sets table (for rest between individual sets)
ALTER TABLE exercise_sets 
ADD COLUMN rest_time_seconds INTEGER DEFAULT 60;

-- Add notes and rest timer to routine_exercises table (for workout templates)
ALTER TABLE routine_exercises 
ADD COLUMN notes TEXT,
ADD COLUMN rest_time_seconds INTEGER DEFAULT 60;

-- Add comments for clarity
COMMENT ON COLUMN workouts.notes IS 'General notes or observations about the entire workout session';
COMMENT ON COLUMN workout_exercises.notes IS 'Notes specific to this exercise within the workout (form cues, observations, etc.)';
COMMENT ON COLUMN workout_exercises.rest_time_seconds IS 'Rest time in seconds after completing all sets of this exercise';
COMMENT ON COLUMN exercise_sets.rest_time_seconds IS 'Rest time in seconds after completing this individual set';
COMMENT ON COLUMN routine_exercises.notes IS 'Default notes for this exercise in the routine template';
COMMENT ON COLUMN routine_exercises.rest_time_seconds IS 'Default rest time for this exercise in the routine template'; 