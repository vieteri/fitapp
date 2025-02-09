-- Drop existing tables if they exist
DROP TABLE IF EXISTS exercise_sets CASCADE;
DROP TABLE IF EXISTS workout_exercises CASCADE;
DROP TABLE IF EXISTS workouts CASCADE;
DROP TABLE IF EXISTS routine_exercises CASCADE;
DROP TABLE IF EXISTS routines CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create tables
CREATE TABLE profiles (
  id uuid references auth.users primary key,
  username text,
  full_name text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE exercises (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE routines (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE routine_exercises (
  id uuid primary key default uuid_generate_v4(),
  routine_id uuid references routines on delete cascade not null,
  exercise_id uuid references exercises not null,
  sets integer not null default 1,
  reps integer,
  weight numeric,
  duration_minutes integer,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE workouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  routine_id uuid references routines,
  name text not null,
  notes text,
  status text not null default 'in_progress',
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE workout_exercises (
  id uuid primary key default uuid_generate_v4(),
  workout_id uuid references workouts on delete cascade not null,
  exercise_id uuid references exercises not null,
  sets integer not null default 1,
  reps integer,
  weight numeric,
  duration_minutes integer,
  order_index integer not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE exercise_sets (
  id uuid primary key default uuid_generate_v4(),
  workout_exercise_id uuid references workout_exercises on delete cascade not null,
  set_number integer not null,
  reps integer,
  weight numeric,
  duration_minutes integer,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Exercises policies
CREATE POLICY "Users can view own exercises" ON exercises
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create exercises" ON exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exercises" ON exercises
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exercises" ON exercises
  FOR DELETE USING (auth.uid() = user_id);

-- Routines policies
CREATE POLICY "Users can view own routines" ON routines
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create routines" ON routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own routines" ON routines
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own routines" ON routines
  FOR DELETE USING (auth.uid() = user_id);

-- Routine exercises policies
CREATE POLICY "Users can view routine exercises" ON routine_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = routine_exercises.routine_id
      AND routines.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can manage routine exercises" ON routine_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = routine_exercises.routine_id
      AND routines.user_id = auth.uid()
    )
  );

-- Workouts policies
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Workout exercises policies
CREATE POLICY "Users can manage workout exercises" ON workout_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Exercise sets policies
CREATE POLICY "Users can manage exercise sets" ON exercise_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workout_exercises
      JOIN workouts ON workouts.id = workout_exercises.workout_id
      WHERE workout_exercises.id = exercise_sets.workout_exercise_id
      AND workouts.user_id = auth.uid()
    )
  ); 