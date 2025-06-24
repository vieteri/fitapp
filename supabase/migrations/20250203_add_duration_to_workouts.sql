-- Add duration column to workouts table
ALTER TABLE workouts ADD COLUMN duration TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN workouts.duration IS 'Workout duration in flexible format (HH:MM:SS, MM:SS, seconds, or minutes)'; 