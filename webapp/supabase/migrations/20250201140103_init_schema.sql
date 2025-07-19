-- Create core tables first

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    muscle_group VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR,
    birthday DATE,
    height INTEGER, -- in cm
    weight INTEGER, -- in kg
    avatar_url VARCHAR,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create routines table
CREATE TABLE IF NOT EXISTS public.routines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create routine_exercises table
CREATE TABLE IF NOT EXISTS public.routine_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight DECIMAL,
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create workout_exercises table
CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight DECIMAL,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create exercise_sets table
CREATE TABLE IF NOT EXISTS public.exercise_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE CASCADE,
    routine_exercise_id UUID REFERENCES routine_exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight DECIMAL,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT exercise_sets_workout_or_routine_check CHECK (
        (workout_exercise_id IS NOT NULL AND routine_exercise_id IS NULL) OR
        (workout_exercise_id IS NULL AND routine_exercise_id IS NOT NULL)
    )
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON public.exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON public.routines(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_id ON public.routine_exercises(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_exercises_exercise_id ON public.routine_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON public.workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id ON public.workout_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_workout_exercise_id ON public.exercise_sets(workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_routine_exercise_id ON public.exercise_sets(routine_exercise_id);

-- Enable RLS for all tables
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Exercises policies (public read access)
CREATE POLICY "Anyone can view exercises"
    ON public.exercises
    FOR SELECT
    USING (true);

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Routines policies
CREATE POLICY "Users can view their own routines"
    ON public.routines
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own routines"
    ON public.routines
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routines"
    ON public.routines
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routines"
    ON public.routines
    FOR DELETE
    USING (auth.uid() = user_id);

-- Workouts policies
CREATE POLICY "Users can view their own workouts"
    ON public.workouts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts"
    ON public.workouts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts"
    ON public.workouts
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts"
    ON public.workouts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Routine exercises policies
CREATE POLICY "Users can view their own routine exercises"
    ON public.routine_exercises
    FOR SELECT
    USING (
        routine_id IN (
            SELECT id FROM routines WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own routine exercises"
    ON public.routine_exercises
    FOR INSERT
    WITH CHECK (
        routine_id IN (
            SELECT id FROM routines WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own routine exercises"
    ON public.routine_exercises
    FOR UPDATE
    USING (
        routine_id IN (
            SELECT id FROM routines WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own routine exercises"
    ON public.routine_exercises
    FOR DELETE
    USING (
        routine_id IN (
            SELECT id FROM routines WHERE user_id = auth.uid()
        )
    );

-- Workout exercises policies
CREATE POLICY "Users can view their own workout exercises"
    ON public.workout_exercises
    FOR SELECT
    USING (
        workout_id IN (
            SELECT id FROM workouts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own workout exercises"
    ON public.workout_exercises
    FOR INSERT
    WITH CHECK (
        workout_id IN (
            SELECT id FROM workouts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own workout exercises"
    ON public.workout_exercises
    FOR UPDATE
    USING (
        workout_id IN (
            SELECT id FROM workouts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own workout exercises"
    ON public.workout_exercises
    FOR DELETE
    USING (
        workout_id IN (
            SELECT id FROM workouts WHERE user_id = auth.uid()
        )
    );

-- Exercise sets policies
CREATE POLICY "Users can view their own exercise sets"
    ON public.exercise_sets
    FOR SELECT
    USING (
        workout_exercise_id IN (
            SELECT we.id 
            FROM workout_exercises we
            JOIN workouts w ON w.id = we.workout_id
            WHERE w.user_id = auth.uid()
        )
        OR
        routine_exercise_id IN (
            SELECT re.id 
            FROM routine_exercises re
            JOIN routines r ON r.id = re.routine_id
            WHERE r.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own exercise sets"
    ON public.exercise_sets
    FOR INSERT
    WITH CHECK (
        workout_exercise_id IN (
            SELECT we.id 
            FROM workout_exercises we
            JOIN workouts w ON w.id = we.workout_id
            WHERE w.user_id = auth.uid()
        )
        OR
        routine_exercise_id IN (
            SELECT re.id 
            FROM routine_exercises re
            JOIN routines r ON r.id = re.routine_id
            WHERE r.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own exercise sets"
    ON public.exercise_sets
    FOR UPDATE
    USING (
        workout_exercise_id IN (
            SELECT we.id 
            FROM workout_exercises we
            JOIN workouts w ON w.id = we.workout_id
            WHERE w.user_id = auth.uid()
        )
        OR
        routine_exercise_id IN (
            SELECT re.id 
            FROM routine_exercises re
            JOIN routines r ON r.id = re.routine_id
            WHERE r.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own exercise sets"
    ON public.exercise_sets
    FOR DELETE
    USING (
        workout_exercise_id IN (
            SELECT we.id 
            FROM workout_exercises we
            JOIN workouts w ON w.id = we.workout_id
            WHERE w.user_id = auth.uid()
        )
        OR
        routine_exercise_id IN (
            SELECT re.id 
            FROM routine_exercises re
            JOIN routines r ON r.id = re.routine_id
            WHERE r.user_id = auth.uid()
        )
    );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON public.exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routines_updated_at
    BEFORE UPDATE ON public.routines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON public.workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routine_exercises_updated_at
    BEFORE UPDATE ON public.routine_exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_exercises_updated_at
    BEFORE UPDATE ON public.workout_exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_sets_updated_at
    BEFORE UPDATE ON public.exercise_sets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert comprehensive exercise data for AI routine generation
INSERT INTO public.exercises (id, name, description, muscle_group) VALUES
-- Upper Body - Chest
('11111111-1111-1111-1111-111111111111', 'Bench Press', 'Barbell bench press for chest development and upper body strength', 'chest'),
('11111111-1111-1111-1111-111111111112', 'Incline Bench Press', 'Incline barbell bench press targeting upper chest', 'chest'),
('11111111-1111-1111-1111-111111111113', 'Dumbbell Flyes', 'Dumbbell chest flyes for chest isolation', 'chest'),
('11111111-1111-1111-1111-111111111114', 'Push-ups', 'Bodyweight push-ups for chest, shoulders, and triceps', 'chest'),
('11111111-1111-1111-1111-111111111115', 'Dips', 'Parallel bar dips for chest and triceps', 'chest'),

-- Upper Body - Back
('22222222-2222-2222-2222-222222222221', 'Pull-ups', 'Bodyweight pull-ups for back and biceps', 'back'),
('22222222-2222-2222-2222-222222222222', 'Lat Pulldowns', 'Cable lat pulldowns for back width', 'back'),
('22222222-2222-2222-2222-222222222223', 'Barbell Rows', 'Bent-over barbell rows for back thickness', 'back'),
('22222222-2222-2222-2222-222222222224', 'Dumbbell Rows', 'Single-arm dumbbell rows for back development', 'back'),
('22222222-2222-2222-2222-222222222225', 'Deadlifts', 'Conventional deadlifts for overall back and posterior chain', 'back'),

-- Upper Body - Shoulders
('33333333-3333-3333-3333-333333333331', 'Overhead Press', 'Standing barbell overhead press for shoulder strength', 'shoulders'),
('33333333-3333-3333-3333-333333333332', 'Lateral Raises', 'Dumbbell lateral raises for shoulder width', 'shoulders'),
('33333333-3333-3333-3333-333333333333', 'Rear Delt Flyes', 'Rear deltoid flyes for posterior shoulder health', 'shoulders'),
('33333333-3333-3333-3333-333333333334', 'Arnold Press', 'Arnold press for complete shoulder development', 'shoulders'),
('33333333-3333-3333-3333-333333333335', 'Face Pulls', 'Cable face pulls for rear delts and upper back', 'shoulders'),

-- Upper Body - Arms
('44444444-4444-4444-4444-444444444441', 'Bicep Curls', 'Barbell bicep curls for arm development', 'biceps'),
('44444444-4444-4444-4444-444444444442', 'Hammer Curls', 'Dumbbell hammer curls for biceps and forearms', 'biceps'),
('44444444-4444-4444-4444-444444444443', 'Tricep Dips', 'Tricep dips for arm strength', 'triceps'),
('44444444-4444-4444-4444-444444444444', 'Close-Grip Bench Press', 'Close-grip bench press for triceps', 'triceps'),
('44444444-4444-4444-4444-444444444445', 'Tricep Extensions', 'Overhead tricep extensions', 'triceps'),

-- Lower Body - Legs
('55555555-5555-5555-5555-555555555551', 'Squats', 'Barbell back squats for leg strength and mass', 'legs'),
('55555555-5555-5555-5555-555555555552', 'Front Squats', 'Front squats for quad-focused leg development', 'legs'),
('55555555-5555-5555-5555-555555555553', 'Lunges', 'Walking lunges for unilateral leg strength', 'legs'),
('55555555-5555-5555-5555-555555555554', 'Leg Press', 'Machine leg press for quad and glute development', 'legs'),
('55555555-5555-5555-5555-555555555555', 'Romanian Deadlifts', 'Romanian deadlifts for hamstrings and glutes', 'legs'),
('55555555-5555-5555-5555-555555555556', 'Calf Raises', 'Standing calf raises for lower leg development', 'calves'),
('55555555-5555-5555-5555-555555555557', 'Leg Curls', 'Hamstring curls for posterior thigh development', 'hamstrings'),
('55555555-5555-5555-5555-555555555558', 'Leg Extensions', 'Quad extensions for front thigh isolation', 'quadriceps'),

-- Core
('66666666-6666-6666-6666-666666666661', 'Planks', 'Core planks for abdominal strength and stability', 'core'),
('66666666-6666-6666-6666-666666666662', 'Crunches', 'Abdominal crunches for core development', 'core'),
('66666666-6666-6666-6666-666666666663', 'Russian Twists', 'Russian twists for oblique strength', 'core'),
('66666666-6666-6666-6666-666666666664', 'Dead Bug', 'Dead bug exercise for core stability', 'core'),
('66666666-6666-6666-6666-666666666665', 'Mountain Climbers', 'Mountain climbers for core and cardio', 'core'),

-- Cardio
('77777777-7777-7777-7777-777777777771', 'Running', 'Outdoor or treadmill running for cardiovascular fitness', 'cardio'),
('77777777-7777-7777-7777-777777777772', 'Cycling', 'Stationary or outdoor cycling for cardio and leg endurance', 'cardio'),
('77777777-7777-7777-7777-777777777773', 'Rowing', 'Rowing machine for full-body cardio', 'cardio'),
('77777777-7777-7777-7777-777777777774', 'Jump Rope', 'Jump rope for agility and cardiovascular fitness', 'cardio'),
('77777777-7777-7777-7777-777777777775', 'Burpees', 'Full-body burpees for strength and cardio', 'cardio')

ON CONFLICT (id) DO NOTHING; 