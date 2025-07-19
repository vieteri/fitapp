# FitApp

A comprehensive fitness tracking application built with Next.js, Supabase, and AI-powered coaching features.

## Project Structure

- **`webapp/`** - Next.js application with Supabase backend
- **`robot-tests/`** - End-to-end test suite using Robot Framework

## Features

- **Exercise Management** - Create and manage custom exercises with muscle group targeting
- **Workout Routines** - Build reusable workout templates with exercises, sets, and reps
- **Workout Tracking** - Log actual workout sessions with performance data
- **Notes & Rest Timers** - Multi-level notes system and configurable rest timers
- **AI Fitness Coach** - Gemini 2.0 Flash integration with text-to-speech capabilities
- **User Profiles** - Personal fitness profiles with stats and history

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Supabase account and project
- Google Gemini API key (for AI features)

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fitapp
   ```

2. Set up the web application:
   ```bash
   cd webapp/
   npm install  # or bun install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase and Gemini API credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run database migrations in your Supabase dashboard:
   - Execute the SQL files in `webapp/supabase/migrations/`

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Visit `http://localhost:3000`

## Deployment

### Deploy to Vercel

The app is configured to deploy from the `webapp/` subdirectory:

1. **Import your GitHub repository** to Vercel
2. **Configure build settings** (or use the included `vercel.json`):
   - **Root Directory**: `webapp`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

3. **Set environment variables** in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Deploy** - Vercel will automatically deploy from your main branch

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vieteri/fitapp&project-name=fitapp&root-directory=webapp)

## Development

### Common Commands

```bash
cd webapp/
npm run dev              # Start development server
npm run build            # Build for production
npm run generate-types   # Generate Supabase TypeScript types
```

### Testing

- **Unit Tests**: Bun test runner in `webapp/__tests__/`
- **E2E Tests**: Robot Framework in `robot-tests/`

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI Components**: shadcn/ui, Radix UI
- **AI**: Google Gemini 2.0 Flash
- **Testing**: Bun Test, Robot Framework
- **Deployment**: Vercel

## Database Schema

- **exercises** - Global exercise library
- **profiles** - User profiles and preferences  
- **routines** - Workout templates
- **workouts** - Individual workout sessions
- **routine_exercises** - Exercise configurations in routines
- **workout_exercises** - Actual exercise performance data
- **exercise_sets** - Individual set tracking

## Contributing

1. Follow the code conventions outlined in `CLAUDE.md`
2. Use kebab-case for component filenames
3. Prefer Server Components over Client Components
4. Always include loading and error states
5. Run tests before submitting PRs

## License

MIT License - see LICENSE file for details