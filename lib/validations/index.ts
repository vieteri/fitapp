import { z } from 'zod';

// Re-export existing auth schemas
export { emailSchema, passwordSchema, urlSchema } from '@/utils/validation';

// Common base schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const positiveIntSchema = z.number().int().positive('Must be a positive integer');
export const nonNegativeIntSchema = z.number().int().min(0, 'Must be non-negative');
export const positiveNumberSchema = z.number().positive('Must be a positive number');
export const nonNegativeNumberSchema = z.number().min(0, 'Must be non-negative');

// Muscle group enum (common muscle groups)
export const muscleGroupSchema = z.enum([
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'abs', 'legs', 'glutes', 'calves', 'cardio', 'full-body', 'other'
], { required_error: 'Muscle group is required' });

// Exercise schemas
export const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required').max(100, 'Exercise name too long'),
  description: z.string().max(500, 'Description too long').nullable().optional(),
  muscle_group: muscleGroupSchema
});

export const exerciseUpdateSchema = exerciseSchema.partial();

export const exerciseIdParamSchema = z.object({
  id: uuidSchema
});

// Exercise set schemas
export const exerciseSetSchema = z.object({
  set_number: positiveIntSchema,
  reps: positiveIntSchema,
  weight: positiveNumberSchema.nullable().optional(),
  duration_minutes: positiveNumberSchema.nullable().optional(),
  rest_time_seconds: nonNegativeIntSchema.nullable().optional().default(60)
});

export const exerciseSetCreateSchema = exerciseSetSchema.omit({ set_number: true });

// Routine exercise schemas
export const routineExerciseSchema = z.object({
  exercise_id: uuidSchema,
  sets: positiveIntSchema.min(1, 'Must have at least 1 set'),
  reps: positiveIntSchema.min(1, 'Must have at least 1 rep'),
  weight: positiveNumberSchema.nullable().optional(),
  duration_minutes: positiveNumberSchema.nullable().optional(),
  order_index: nonNegativeIntSchema,
  rest_time_seconds: nonNegativeIntSchema.nullable().optional().default(60),
  notes: z.string().max(500, 'Notes too long').nullable().optional(),
  sets_data: z.array(exerciseSetCreateSchema).optional()
});

// Routine schemas
export const routineCreateSchema = z.object({
  name: z.string().min(1, 'Routine name is required').max(100, 'Routine name too long'),
  description: z.string().max(500, 'Description too long').nullable().optional(),
  duration: z.string().max(50, 'Duration too long').nullable().optional(),
  exercises: z.array(routineExerciseSchema).min(1, 'Routine must have at least one exercise')
});

export const routineUpdateSchema = z.object({
  name: z.string().min(1, 'Routine name is required').max(100, 'Routine name too long').optional(),
  description: z.string().max(500, 'Description too long').nullable().optional(),
  duration: z.string().max(50, 'Duration too long').nullable().optional(),
  exercises: z.array(routineExerciseSchema).optional()
});

export const routineIdParamSchema = z.object({
  id: uuidSchema
});

// Workout exercise schemas
export const workoutExerciseSchema = z.object({
  exercise_id: uuidSchema.optional(),
  reps: positiveIntSchema.min(1, 'Must have at least 1 rep'),
  sets: positiveIntSchema.min(1, 'Must have at least 1 set'),
  weight: positiveNumberSchema.nullable().optional(),
  duration_minutes: positiveNumberSchema.nullable().optional(),
  notes: z.string().max(500, 'Notes too long').nullable().optional(),
  rest_time_seconds: nonNegativeIntSchema.nullable().optional()
});

// Workout schemas
export const workoutCreateSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(100, 'Workout name too long').optional(),
  description: z.string().max(500, 'Description too long').nullable().optional(),
  duration: z.string().max(50, 'Duration too long').nullable().optional(),
  notes: z.string().max(1000, 'Notes too long').nullable().optional(),
  exercises: z.array(workoutExerciseSchema).optional()
});

export const workoutUpdateSchema = workoutCreateSchema.partial();

export const workoutIdParamSchema = z.object({
  id: uuidSchema
});

// Profile schemas
export const profileUpdateSchema = z.object({
  full_name: z.string().max(100, 'Full name too long').nullable().optional(),
  birthday: z.string().datetime('Invalid date format').nullable().optional(),
  height: z.number().min(0, 'Height must be positive').max(300, 'Height must be less than 300cm').nullable().optional(),
  weight: z.number().min(0, 'Weight must be positive').max(1000, 'Weight must be less than 1000kg').nullable().optional(),
  avatar_url: z.string().url('Invalid URL format').nullable().optional()
});

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').optional().default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional().default(10),
  offset: z.coerce.number().int().min(0, 'Offset must be non-negative').optional()
});

// Query parameter schemas
export const routineQuerySchema = paginationSchema.extend({
  search: z.string().max(100, 'Search term too long').optional(),
  muscle_group: muscleGroupSchema.optional()
});

export const workoutHistoryQuerySchema = paginationSchema.extend({
  start_date: z.string().datetime('Invalid start date format').optional(),
  end_date: z.string().datetime('Invalid end date format').optional()
});

export const exerciseQuerySchema = paginationSchema.extend({
  search: z.string().max(100, 'Search term too long').optional(),
  muscle_group: muscleGroupSchema.optional()
});

// Authentication schemas (for completeness)
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const signUpSchema = loginSchema;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  callbackUrl: z.string().url('Invalid callback URL').optional()
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// AI/Generation schemas
export const generateRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000, 'Prompt too long'),
  context: z.string().max(2000, 'Context too long').optional()
});

export const ttsRequestSchema = z.object({
  text: z.string().min(1, 'Text is required').max(5000, 'Text too long'),
  voice: z.string().min(1, 'Voice is required').optional()
});

// Type exports for use in API routes
export type ExerciseCreate = z.infer<typeof exerciseSchema>;
export type ExerciseUpdate = z.infer<typeof exerciseUpdateSchema>;
export type RoutineCreate = z.infer<typeof routineCreateSchema>;
export type RoutineUpdate = z.infer<typeof routineUpdateSchema>;
export type WorkoutCreate = z.infer<typeof workoutCreateSchema>;
export type WorkoutUpdate = z.infer<typeof workoutUpdateSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type RoutineQuery = z.infer<typeof routineQuerySchema>;
export type WorkoutHistoryQuery = z.infer<typeof workoutHistoryQuerySchema>;
export type ExerciseQuery = z.infer<typeof exerciseQuerySchema>;