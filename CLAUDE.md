# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a Next.js fitness application with two main directories:
- **`webapp/`** - Main Next.js application using App Router, Supabase, and TypeScript
- **`robot-tests/`** - Robot Framework end-to-end test suite

## Development Commands

All development work should be done in the `webapp/` directory:

```bash
cd webapp/
npm run dev          # Start development server with Turbo
npm run build        # Build for production
npm start            # Start production server
npm run generate-types  # Generate Supabase TypeScript types
```

Note: This project uses Bun as the package manager. Tests are written for Bun test runner (see `__tests__/setup.ts`).

## Architecture Overview

### Database Schema (Supabase)
- **`exercises`** - Global exercise library with name, description, muscle_group
- **`profiles`** - User profiles linked to auth.users 
- **`routines`** - User-created workout templates containing exercises
- **`workouts`** - Individual workout sessions
- **`routine_exercises`** - Junction table linking routines to exercises with sets/reps/notes/rest timers
- **`workout_exercises`** - Junction table linking workouts to exercises with actual performance data
- **`exercise_sets`** - Individual set data within workout exercises

### Key Features
- **Notes System**: Multi-level notes (workout-level, exercise-level in routines, exercise-level in workouts)
- **Rest Timers**: Between exercises and between sets with configurable durations
- **AI Integration**: Gemini 2.0 Flash for fitness coaching with TTS at `/chat/tts`

### Authentication & Data Flow
- Uses Supabase Auth with cookie-based sessions
- User data scoped by `user_id` foreign keys
- Server Components for data fetching, Client Components for interactivity
- Form handling via Server Actions in `app/actions.ts` and `app/server-actions.ts`

### Component Organization
- **`components/ui/`** - shadcn/ui components and custom UI primitives
- **`components/exercises/`** - Exercise-related components
- **`components/routines/`** - Routine management components  
- **`components/workouts/`** - Workout tracking components
- **`components/profile/`** - User profile components
- **`components/ai/`** - AI chat and TTS components

### Code Conventions (from Cursor rules)
- Use kebab-case for component filenames (e.g., `my-component.tsx`)
- Favor Server Components over Client Components
- Always add loading and error states
- Use semantic HTML elements
- Follow existing patterns for API routes in `app/api/`

## Database Migrations

Located in `webapp/supabase/migrations/`:
- Initial schema: `20250201140103_init_schema.sql`
- Duration tracking: `20250203_add_duration_to_workouts.sql`  
- Notes & timers: `20250203_add_notes_and_rest_timers.sql`

Generate new types after schema changes: `npm run generate-types`

## Testing

- Unit tests: Bun test runner in `__tests__/`
- E2E tests: Robot Framework in `robot-tests/`
- Test data cleanup handled in `__tests__/setup.ts`

## Environment Variables

Required for development:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key  # For AI features
```