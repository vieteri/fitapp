# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Primary Commands:**
```bash
# Development server (uses Turbopack for fast rebuilds)
bun run dev

# Production build (required before deployment)
bun next build

# Start production server
bun start

# Generate TypeScript types from Supabase schema
bun run generate-types
```

**Package Management:**
- Uses **Bun** as package manager (not npm/yarn)
- Lockfile: `bun.lockb` (ignore the warning about multiple lockfiles)
- Configuration: `bunfig.toml`

## Project Architecture

### Stack Overview
- **Next.js 15.4.0-canary** with App Router and React 19
- **Supabase** for authentication, database (PostgreSQL), and real-time features
- **TypeScript** with strict mode and generated Supabase types
- **Tailwind CSS** + **shadcn/ui** components
- **Google Gemini 2.0 Flash** for AI fitness coaching with TTS capabilities

### Directory Structure
```
app/                    # Next.js App Router
├── (auth-pages)/      # Auth pages (sign-in, sign-up, etc.)
├── api/               # API routes with standardized patterns
├── exercises/         # Exercise management
├── routines/          # Workout routine templates
├── workouts/          # Workout tracking and history
├── profile/           # User profile management
└── chat/              # AI fitness coach interfaces

components/            # React components by feature
├── ui/                # Base shadcn/ui components
├── exercises/         # Exercise-specific components
├── routines/          # Routine management components
├── workouts/          # Workout tracking components
├── ai/                # AI chat and TTS components
└── profile/           # Profile management components

lib/                   # Backend utilities and business logic
├── api/               # Standardized API patterns
├── auth/              # Authentication middleware
└── validations/       # Zod validation schemas

utils/                 # Client-side utilities
types/                 # TypeScript definitions (includes generated Supabase types)
supabase/              # Database migrations and config
```

### API Architecture

**Standardized Patterns** (located in `/lib/api/`):
- **Error handling**: Centralized error types and HTTP status codes (`errors.ts`)
- **Response formatting**: Consistent API response structure (`responses.ts`)
- **Validation**: Zod schemas for request validation (`validation.ts`)
- **Authentication**: JWT token validation middleware (`auth.ts`)
- **Database helpers**: Common CRUD operations (`database.ts`)

**All API routes use these patterns:**
```typescript
export const POST = withErrorHandling(async (request: NextRequest) => {
  const data = await extractAndValidate(request, schema);
  // Business logic here
  return Responses.success(result);
});
```

### Database Schema

**Core Tables:**
- `profiles` - User data (height, weight, BMI, birthday)
- `exercises` - Exercise library with muscle groups
- `routines` - Workout routine templates
- `workouts` - Actual workout sessions
- `routine_exercises` - Exercises within routines (with notes, rest timers)
- `workout_exercises` - Exercises within workouts (with performance data)
- `exercise_sets` - Individual sets (reps, weight, duration, rest times)

**Key Features:**
- **Row Level Security (RLS)** enforced on all user data
- **Notes system** throughout (workouts, exercises, routines)
- **Rest timer management** with flexible duration formats
- **Exercise type detection** (cardio vs strength automatically handled)

### Authentication Flow
- **Supabase Auth** with JWT tokens stored in HTTP-only cookies
- **Middleware protection** at `/middleware.ts` for protected routes
- **Session management** via `@supabase/ssr` for server-side rendering
- **User context** available in all server components and API routes

### AI Features

**Gemini Integration:**
- API endpoint: `/api/generate` and `/api/generate-tts`
- Environment variable: `GEMINI_API_KEY`
- Specialized fitness prompts with mobile-optimized formatting
- Personal data integration (user profile, workout history)

**Text-to-Speech:**
- Custom hook: `useTTS()` using Web Speech API
- Components: `SimpleTTSChat`, `AITTSChat`
- Voice selection and auto-play functionality
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

## Development Guidelines

### TypeScript Patterns
- **Generated types**: Run `bun run generate-types` after database schema changes
- **Validation schemas**: All located in `/lib/validations/index.ts`
- **Strict null checks**: Handle optional properties explicitly (use `|| defaultValue`)
- **Component props**: Use `interface` for component props, `type` for unions

### Component Patterns
- **shadcn/ui components**: Extend base components in `/components/ui/`
- **Feature components**: Group by domain (exercises, routines, workouts)
- **Server vs Client**: Use `"use client"` directive only when necessary
- **Loading states**: Use Suspense boundaries and loading.tsx files

### API Development
- **Always use** the standardized patterns from `/lib/api/`
- **Validation first**: Extract and validate request data before business logic
- **Error handling**: Throw `CommonErrors` for consistent responses
- **Response format**: Use `Responses.success()`, `Responses.paginated()`, etc.

### Database Operations
- **Type safety**: Import types from `/types/supabase-types.ts`
- **RLS policies**: Ensure user isolation in all queries
- **Joins**: Prefer `.select()` with relations over multiple queries
- **Pagination**: Use the standardized pagination schema and helpers

### Styling
- **Tailwind CSS**: Utility-first with custom design tokens
- **CSS variables**: Defined in `globals.css` for theming
- **Dark mode**: Automatic via `next-themes` with system preference
- **Mobile-first**: Responsive design with `sm:`, `md:`, `lg:` breakpoints

## Common Development Tasks

### Adding New Features
1. **Database**: Create migration in `/supabase/migrations/`
2. **Types**: Run `bun run generate-types` 
3. **Validation**: Add schemas to `/lib/validations/index.ts`
4. **API routes**: Use patterns from `/lib/api/`
5. **Components**: Follow feature-based organization
6. **Pages**: Add to appropriate `/app/` directory

### Testing APIs
- Use the generated Supabase types for type safety
- Test authentication with valid JWT tokens
- Verify RLS policies prevent unauthorized access
- Check pagination and filtering functionality

### Troubleshooting
- **Build errors**: Check TypeScript strict mode compliance
- **Database errors**: Verify RLS policies and user permissions
- **Auth issues**: Check middleware configuration and cookie settings
- **Supabase connection**: Verify environment variables in `.env.local`

## Environment Variables

Required for development:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

## Key Files to Understand

- `/middleware.ts` - Route protection and authentication
- `/lib/api/` - Standardized API patterns and utilities
- `/lib/validations/index.ts` - All validation schemas
- `/types/supabase-types.ts` - Generated database types
- `/utils/supabase/server.ts` - Server-side Supabase client
- `/components/ui/` - Base component library
- `/app/api/` - Example API implementations

This codebase prioritizes type safety, developer experience, and maintainable patterns. Always follow the established conventions and use the provided utilities for consistency.