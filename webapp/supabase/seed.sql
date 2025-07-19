-- Seed some default exercises
INSERT INTO exercises (id, 123b51c8-3d65-410d-86c4-40b845f3e03a, name, description, category) VALUES
('e1', '123b51c8-3d65-410d-86c4-40b845f3e03a', 'Bench Press', 'Barbell bench press for chest development', 'strength'),
('e2', '123b51c8-3d65-410d-86c4-40b845f3e03a', 'Squat', 'Barbell back squat for leg strength', 'strength'),
('e3', '123b51c8-3d65-410d-86c4-40b845f3e03a', 'Deadlift', 'Conventional deadlift for overall strength', 'strength'),
('e4', '123b51c8-3d65-410d-86c4-40b845f3e03a', 'Pull-up', 'Bodyweight pull-ups for back strength', 'strength'),
('e5', '123b51c8-3d65-410d-86c4-40b845f3e03a', 'Running', 'Outdoor or treadmill running', 'cardio');

-- Seed a sample routine
INSERT INTO routines (id, 123b51c8-3d65-410d-86c4-40b845f3e03a, name, description) VALUES
('r1', '123b51c8-3d65-410d-86c4-40b845f3e03a', 'Full Body Workout', 'Complete full body workout for strength');

-- Add exercises to the routine
INSERT INTO routine_exercises (routine_id, exercise_id, sets, reps, order_index) VALUES
('r1', 'e1', 3, 10, 1),
('r1', 'e2', 3, 8, 2),
('r1', 'e3', 3, 5, 3),
('r1', 'e4', 3, 8, 4);

-- Seed a sample workout
INSERT INTO workouts (id, 123b51c8-3d65-410d-86c4-40b845f3e03a, routine_id, name, status) VALUES
('w1', '123b51c8-3d65-410d-86c4-40b845f3e03a', 'r1', 'Morning Workout', 'completed');

-- Add exercises to the workout
INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, order_index) VALUES
('w1', 'e1', 3, 10, 1),
('w1', 'e2', 3, 8, 2),
('w1', 'e3', 3, 5, 3),
('w1', 'e4', 3, 8, 4); 