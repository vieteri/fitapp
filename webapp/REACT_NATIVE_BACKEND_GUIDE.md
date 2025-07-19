# FitApp Backend API Documentation for React Native

## Overview
This document provides complete backend integration details for building a React Native fitness app using the FitApp Next.js backend.

## Base Configuration

### Environment Setup
```javascript
// config.js
export const API_CONFIG = {
  BASE_URL: 'https://your-fitapp-backend.vercel.app', // Replace with your deployed URL
  ENDPOINTS: {
    AUTH: '/api/auth',
    PROFILE: '/api/profile',
    EXERCISES: '/api/exercises',
    ROUTINES: '/api/routines',
    WORKOUTS: '/api/workouts',
    AI_CHAT: '/api/generate',
    TTS: '/api/generate-tts'
  }
};
```

## Authentication System

### JWT Token-Based Authentication
The backend uses JWT tokens stored in headers for authentication.

#### Auth Flow
1. **Sign Up**: `POST /api/auth/sign-up`
2. **Sign In**: `POST /api/auth/login` 
3. **Token Refresh**: `POST /api/auth/refresh`
4. **Sign Out**: `POST /api/auth/sign-out`

#### Token Management
```javascript
// authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthService = {
  // Store token
  async setToken(token) {
    await AsyncStorage.setItem('access_token', token);
  },

  // Get token
  async getToken() {
    return await AsyncStorage.getItem('access_token');
  },

  // Remove token
  async removeToken() {
    await AsyncStorage.removeItem('access_token');
  },

  // Add auth header to requests
  async getAuthHeaders() {
    const token = await this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};
```

#### Authentication API Calls
```javascript
// Sign Up
const signUp = async (email, password) => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/sign-up`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Sign In
const signIn = async (email, password) => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (data.access_token) {
    await AuthService.setToken(data.access_token);
  }
  return data;
};
```

#### Authentication Response Examples
```javascript
// POST /api/auth/sign-up - Success
{
  "success": true,
  "message": "User created successfully"
}

// POST /api/auth/login - Success
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "123b51c8-3d65-410d-86c4-40b845f3e03a",
    "email": "user@example.com"
  }
}

// Error Response
{
  "error": "Invalid credentials",
  "details": "Email or password is incorrect"
}
```

## Database Schema & Types

### User Profile
```typescript
interface Profile {
  id: string;
  full_name: string | null;
  birthday: string | null; // ISO date string
  height: number | null; // in centimeters
  weight: number | null; // in kilograms
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
}

// Extended profile with computed fields
interface ExtendedProfile extends Profile {
  email: string;
  age?: number; // calculated from birthday
  bmi?: {
    value: number;
    category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  };
}
```

### Exercises
```typescript
interface Exercise {
  id: string;
  name: string;
  description: string | null;
  muscle_group: string;
  created_at: string;
  updated_at: string | null;
}

// Utility functions for exercise types
const isCardioExercise = (exercise: Exercise): boolean => {
  const cardioMuscleGroups = ['cardio', 'cardiovascular'];
  const cardioKeywords = ['run', 'bike', 'cycle', 'swim', 'walk', 'jog', 'treadmill', 'elliptical'];
  
  return cardioMuscleGroups.includes(exercise.muscle_group.toLowerCase()) ||
         cardioKeywords.some(keyword => exercise.name.toLowerCase().includes(keyword));
};

const isDistanceBasedCardio = (exerciseName: string): boolean => {
  const distanceKeywords = ['run', 'bike', 'cycle', 'swim', 'walk', 'jog', 'rowing'];
  return distanceKeywords.some(keyword => exerciseName.toLowerCase().includes(keyword));
};
```

### Routines (Updated with Notes & Rest Times)
```typescript
interface Routine {
  id: string;
  name: string;
  description: string | null;
  duration: string | null; // e.g., "45 minutes" or "1:30:00"
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight: number | null;
  duration_minutes: number | null;
  notes: string | null; // NEW: Personal notes for the exercise
  rest_time_seconds: number | null; // NEW: Rest time between sets
  order_index: number;
  created_at: string;
  updated_at: string;
  exercise?: Exercise; // populated in API responses
}

interface ExerciseSet {
  id: string;
  routine_exercise_id: string | null;
  workout_exercise_id: string | null;
  set_number: number;
  reps: number;
  weight: number | null;
  duration_minutes: number | null;
  rest_time_seconds: number | null; // NEW: Rest time for individual sets
  created_at: string | null;
  updated_at: string | null;
}
```

### Workouts (Updated with Duration & Notes)
```typescript
interface Workout {
  id: string;
  name: string;
  description: string | null;
  duration: string | null; // NEW: Total workout duration (flexible format)
  notes: string | null; // NEW: Workout notes
  user_id: string;
  created_at: string;
}

interface WorkoutExercise {
  id: string;
  workout_id: string | null;
  exercise_id: string | null;
  sets: number;
  reps: number;
  weight: number | null;
  duration_minutes: number | null;
  notes: string | null; // NEW: Exercise-specific notes
  rest_time_seconds: number | null; // NEW: Rest time between sets
  created_at: string;
  exercise?: Exercise; // populated in API responses
}
```

## API Endpoints with Response Examples

### Profile Management

#### Get Profile
```javascript
const getProfile = async () => {
  const headers = await AuthService.getAuthHeaders();
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/profile`, {
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
  return response.json();
};
```

**Response Example:**
```javascript
// GET /api/profile - Success
{
  "profile": {
    "id": "123b51c8-3d65-410d-86c4-40b845f3e03a",
    "email": "user@example.com",
    "full_name": "John Doe",
    "birthday": "1990-05-15",
    "height": 175,
    "weight": 70,
    "avatar_url": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "age": 34,
    "bmi": {
      "value": 22.9,
      "category": "Normal"
    }
  }
}
```

#### Update Profile
```javascript
const updateProfile = async (profileData) => {
  const headers = await AuthService.getAuthHeaders();
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: profileData.fullName,
      birthday: profileData.birthday, // YYYY-MM-DD format
      height: profileData.height, // number in cm
      weight: profileData.weight  // number in kg
    })
  });
  return response.json();
};
```

**Response Example:**
```javascript
// PUT /api/profile - Success
{
  "success": true,
  "profile": {
    "id": "123b51c8-3d65-410d-86c4-40b845f3e03a",
    "full_name": "John Doe Updated",
    "birthday": "1990-05-15",
    "height": 180,
    "weight": 75,
    // ... other fields
  }
}
```

### Exercise Management

#### Get All Exercises
```javascript
const getExercises = async () => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/exercises`);
  return response.json();
};
```

**Response Example:**
```javascript
// GET /api/exercises - Success
{
  "exercises": [
    {
      "id": "ex-1",
      "name": "Push-ups",
      "description": "Classic bodyweight chest exercise",
      "muscle_group": "chest",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": null
    },
    {
      "id": "ex-2",
      "name": "Running",
      "description": "Cardiovascular exercise",
      "muscle_group": "cardio",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": null
    },
    {
      "id": "ex-3",
      "name": "Cycling",
      "description": "Distance-based cardio exercise",
      "muscle_group": "cardio",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": null
    }
  ]
}
```

#### Get Exercise by ID
```javascript
const getExercise = async (id) => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/exercises/${id}`);
  return response.json();
};
```

**Response Example:**
```javascript
// GET /api/exercises/ex-1 - Success
{
  "exercise": {
    "id": "ex-1",
    "name": "Push-ups",
    "description": "Classic bodyweight chest exercise",
    "muscle_group": "chest",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": null
  }
}
```

#### Create Exercise
```javascript
const createExercise = async (exerciseData) => {
  const headers = await AuthService.getAuthHeaders();
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/exercises`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: exerciseData.name,
      description: exerciseData.description,
      muscle_group: exerciseData.muscleGroup
    })
  });
  return response.json();
};
```

**Response Example:**
```javascript
// POST /api/exercises - Success
{
  "success": true,
  "exercise": {
    "id": "ex-new",
    "name": "Custom Exercise",
    "description": "My custom exercise",
    "muscle_group": "legs",
    "created_at": "2024-02-01T10:00:00Z",
    "updated_at": null
  }
}
```

### Routine Management

#### Get User Routines
```javascript
const getRoutines = async (limit = 0) => {
  const headers = await AuthService.getAuthHeaders();
  const url = limit > 0 
    ? `${API_CONFIG.BASE_URL}/api/routines?limit=${limit}`
    : `${API_CONFIG.BASE_URL}/api/routines`;
  
  const response = await fetch(url, { headers });
  return response.json();
};
```

**Response Example:**
```javascript
// GET /api/routines - Success
{
  "routines": [
    {
      "id": "routine-1",
      "name": "Upper Body Strength",
      "description": "Focus on chest, shoulders, and arms",
      "duration": "45 minutes",
      "user_id": "123b51c8-3d65-410d-86c4-40b845f3e03a",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "routine_exercises": [
        {
          "id": "rex-1",
          "routine_id": "routine-1",
          "exercise_id": "ex-1",
          "sets": 3,
          "reps": 15,
          "weight": null,
          "duration_minutes": null,
          "notes": "Focus on form, slow and controlled",
          "rest_time_seconds": 60,
          "order_index": 0,
          "created_at": "2024-01-01T00:00:00Z",
          "updated_at": "2024-01-15T10:30:00Z",
          "exercise": {
            "id": "ex-1",
            "name": "Push-ups",
            "description": "Classic bodyweight chest exercise",
            "muscle_group": "chest"
          }
        }
      ]
    }
  ]
}
```

#### Create Routine (Updated with Notes & Rest Times)
```javascript
const createRoutine = async (routineData) => {
  const headers = await AuthService.getAuthHeaders();
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/routines`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: routineData.name,
      description: routineData.description,
      duration: routineData.duration, // NEW: Optional duration
      exercises: routineData.exercises.map(ex => ({
        exercise_id: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        duration_minutes: ex.durationMinutes,
        notes: ex.notes, // NEW: Exercise notes
        rest_time_seconds: ex.restTimeSeconds, // NEW: Rest time
        order_index: ex.orderIndex
      }))
    })
  });
  return response.json();
};
```

**Response Example:**
```javascript
// POST /api/routines - Success
{
  "success": true,
  "routine": {
    "id": "routine-new",
    "name": "New Routine",
    "description": "My custom routine",
    "duration": "30 minutes",
    "user_id": "123b51c8-3d65-410d-86c4-40b845f3e03a",
    "created_at": "2024-02-01T10:00:00Z",
    "updated_at": "2024-02-01T10:00:00Z"
  }
}
```

#### Get Routine by ID
```javascript
const getRoutine = async (id) => {
  const headers = await AuthService.getAuthHeaders();
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/routines/${id}`, {
    headers
  });
  return response.json();
};
```

**Response Example:**
```javascript
// GET /api/routines/routine-1 - Success
{
  "routine": {
    "id": "routine-1",
    "name": "Upper Body Strength",
    "description": "Focus on chest, shoulders, and arms",
    "duration": "45 minutes",
    "user_id": "123b51c8-3d65-410d-86c4-40b845f3e03a",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "routine_exercises": [
      {
        "id": "rex-1",
        "routine_id": "routine-1",
        "exercise_id": "ex-1",
        "sets": 3,
        "reps": 15,
        "weight": null,
        "duration_minutes": null,
        "notes": "Focus on form, slow and controlled",
        "rest_time_seconds": 60,
        "order_index": 0,
        "exercise": {
          "id": "ex-1",
          "name": "Push-ups",
          "muscle_group": "chest"
        }
      },
      {
        "id": "rex-2",
        "routine_id": "routine-1",
        "exercise_id": "ex-2",
        "sets": 1,
        "reps": 0,
        "weight": null,
        "duration_minutes": 20,
        "notes": "Maintain steady pace",
        "rest_time_seconds": 300,
        "order_index": 1,
        "exercise": {
          "id": "ex-2",
          "name": "Running",
          "muscle_group": "cardio"
        }
      }
    ]
  }
}
```

### Workout Management

#### Get User Workouts
```javascript
const getWorkouts = async () => {
  const headers = await AuthService.getAuthHeaders();
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/workouts`, {
    headers
  });
  return response.json();
};
```

**Response Example:**
```javascript
// GET /api/workouts - Success
{
  "workouts": [
    {
      "id": "workout-1",
      "name": "Morning Workout",
      "description": "Quick morning session",
      "duration": "1:30:00", // 1 hour 30 minutes
      "notes": "Felt great today, increased weights",
      "user_id": "123b51c8-3d65-410d-86c4-40b845f3e03a",
      "created_at": "2024-02-01T08:00:00Z",
      "workout_exercises": [
        {
          "id": "wex-1",
          "workout_id": "workout-1",
          "exercise_id": "ex-1",
          "sets": 3,
          "reps": 12,
          "weight": 20,
          "duration_minutes": null,
          "notes": "Good form maintained",
          "rest_time_seconds": 90,
          "created_at": "2024-02-01T08:00:00Z",
          "exercise": {
            "id": "ex-1",
            "name": "Push-ups",
            "muscle_group": "chest"
          }
        }
      ]
    }
  ]
}
```

#### Create Workout (Updated with Duration & Notes)
```javascript
const createWorkout = async (workoutData) => {
  const headers = await AuthService.getAuthHeaders();
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/workouts`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: workoutData.name,
      description: workoutData.description,
      duration: workoutData.duration, // NEW: Flexible format (HH:MM:SS, minutes, seconds)
      notes: workoutData.notes, // NEW: Workout notes
      exercises: workoutData.exercises.map(ex => ({
        exercise_id: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        duration_minutes: ex.durationMinutes,
        notes: ex.notes, // NEW: Exercise notes
        rest_time_seconds: ex.restTimeSeconds // NEW: Rest time
      }))
    })
  });
  return response.json();
};
```

**Response Example:**
```javascript
// POST /api/workouts - Success
{
  "success": true,
  "workout": {
    "id": "workout-new",
    "name": "New Workout",
    "description": "My workout session",
    "duration": "45 minutes",
    "notes": "Great session today",
    "user_id": "123b51c8-3d65-410d-86c4-40b845f3e03a",
    "created_at": "2024-02-01T10:00:00Z"
  }
}
```

#### Get Workout History
```javascript
const getWorkoutHistory = async () => {
  const headers = await AuthService.getAuthHeaders();
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/workouts/history`, {
    headers
  });
  return response.json();
};
```

**Response Example:**
```javascript
// GET /api/workouts/history - Success
{
  "workouts": [
    {
      "id": "workout-1",
      "name": "Morning Workout",
      "duration": "1:30:00",
      "created_at": "2024-02-01T08:00:00Z",
      "exercise_count": 5,
      "total_sets": 15
    },
    {
      "id": "workout-2", 
      "name": "Evening Session",
      "duration": "45 minutes",
      "created_at": "2024-01-31T18:00:00Z",
      "exercise_count": 3,
      "total_sets": 9
    }
  ]
}
```

## AI Chat Integration

### AI Fitness Coach
The backend includes an AI fitness coach powered by Google Gemini that provides personalized advice based on user profile data.

#### Send Chat Message
```javascript
const sendChatMessage = async (message, generateRoutines = false) => {
  const headers = await AuthService.getAuthHeaders();
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: message,
      generateRoutines: generateRoutines
    })
  });
  return response.json();
};
```

#### AI Response Format
```typescript
interface AIResponse {
  response: string; // The AI's text response
  isRoutineGeneration?: boolean;
  routines?: GeneratedRoutine[]; // If routine generation was requested
  explanation?: string;
}

interface GeneratedRoutine {
  name: string;
  description: string;
  exercises: {
    exercise_id: string;
    exercise_name: string;
    sets: number;
    reps: number;
    weight: number | null;
    duration_minutes: number | null;
    rest_seconds: number; // NEW: Always includes rest time
    notes: string; // NEW: Always includes exercise notes
    order_index: number;
  }[];
}
```

**Response Examples:**
```javascript
// POST /api/generate - Chat Response
{
  "response": "Based on your profile (John, 34 years old, BMI: 22.9), I recommend starting with 3 sets of push-ups, 12-15 reps each. Focus on proper form and take 60-90 seconds rest between sets.",
  "isRoutineGeneration": false
}

// POST /api/generate - Routine Generation
{
  "response": "I've created a beginner upper body routine for you based on your fitness level.",
  "isRoutineGeneration": true,
  "routines": [
    {
      "name": "Beginner Upper Body",
      "description": "Perfect starter routine for building upper body strength",
      "exercises": [
        {
          "exercise_id": "ex-1",
          "exercise_name": "Push-ups",
          "sets": 3,
          "reps": 12,
          "weight": null,
          "duration_minutes": null,
          "rest_seconds": 60,
          "notes": "Focus on proper form, keep core engaged",
          "order_index": 0
        },
        {
          "exercise_id": "ex-2",
          "exercise_name": "Running",
          "sets": 1,
          "reps": 0,
          "weight": null,
          "duration_minutes": 15,
          "rest_seconds": 300,
          "notes": "Maintain steady pace, breathe regularly",
          "order_index": 1
        }
      ]
    }
  ]
}
```

#### Personalized AI Context
When authenticated, the AI automatically receives user context including:
- Name
- Age (calculated from birthday)
- Height and weight
- BMI and category
- Fitness level considerations

### Text-to-Speech Integration
```javascript
const generateTTS = async (text, voice = 'fenrir', language = 'en-US') => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/generate-tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: text,
      voice: voice,
      language: language
    })
  });
  return response.json();
};
```

**Response Example:**
```javascript
// POST /api/generate-tts - Success
{
  "success": true,
  "audioUrl": "https://api.cartesia.ai/tts/audio/abc123.mp3",
  "duration": 5.2,
  "voice": "fenrir",
  "language": "en-US"
}
```

## Exercise Type Handling

### Cardio vs Strength Exercise Detection
```javascript
// Utility functions for mobile app
const isCardioExercise = (exercise) => {
  const cardioMuscleGroups = ['cardio', 'cardiovascular'];
  const cardioKeywords = ['run', 'bike', 'cycle', 'swim', 'walk', 'jog', 'treadmill', 'elliptical'];
  
  return cardioMuscleGroups.includes(exercise.muscle_group.toLowerCase()) ||
         cardioKeywords.some(keyword => exercise.name.toLowerCase().includes(keyword));
};

const isDistanceBasedCardio = (exerciseName) => {
  const distanceKeywords = ['run', 'bike', 'cycle', 'swim', 'walk', 'jog', 'rowing'];
  return distanceKeywords.some(keyword => exerciseName.toLowerCase().includes(keyword));
};

const getSetLabel = (exercise, setIndex) => {
  if (isCardioExercise(exercise)) {
    if (isDistanceBasedCardio(exercise.name)) {
      return `${setIndex + 1} km`;
    }
    return `Duration ${setIndex + 1}`;
  }
  return `Set ${setIndex + 1}`;
};
```

### Exercise Input Fields by Type
```javascript
// For mobile app UI rendering
const getExerciseInputFields = (exercise) => {
  if (isCardioExercise(exercise)) {
    if (isDistanceBasedCardio(exercise.name)) {
      // Distance-based cardio: Distance + Duration
      return {
        primary: { label: 'Distance (km)', field: 'duration_minutes' },
        secondary: { label: 'Duration (min)', field: 'reps' }
      };
    } else {
      // Time-based cardio: Duration + Optional Reps
      return {
        primary: { label: 'Duration (min)', field: 'duration_minutes' },
        secondary: { label: 'Reps (optional)', field: 'reps' }
      };
    }
  } else {
    // Strength exercises: Reps + Weight + Duration
    return {
      primary: { label: 'Reps', field: 'reps' },
      secondary: { label: 'Weight (kg)', field: 'weight' },
      tertiary: { label: 'Duration (min)', field: 'duration_minutes' }
    };
  }
};
```

## Duration Format Handling

### Flexible Duration Input
The backend accepts duration in multiple formats:
- `"1:30:00"` - HH:MM:SS format
- `"90"` - Minutes as number string
- `"5400"` - Seconds as number string
- `90` - Minutes as number

### Duration Formatting Utilities
```javascript
// For mobile app
const formatDuration = (duration) => {
  if (!duration) return '';
  
  // If it's already formatted (contains colons), return as-is
  if (typeof duration === 'string' && duration.includes(':')) {
    return duration;
  }
  
  // Convert to number (assume minutes if string number)
  const minutes = typeof duration === 'string' ? parseInt(duration) : duration;
  
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
};

const parseDurationToSeconds = (duration) => {
  if (!duration) return 0;
  
  // If it's HH:MM:SS or MM:SS format
  if (typeof duration === 'string' && duration.includes(':')) {
    const parts = duration.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // MM:SS
    }
  }
  
  // If it's a number or string number
  const num = typeof duration === 'string' ? parseInt(duration) : duration;
  
  // Assume minutes if reasonable range, otherwise seconds
  return num > 300 ? num : num * 60;
};
```

## Error Handling

### Standard Error Response
```typescript
interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found
- `500`: Internal Server Error

### Error Response Examples
```javascript
// 400 Bad Request
{
  "error": "Validation failed",
  "details": "Name is required"
}

// 401 Unauthorized
{
  "error": "Unauthorized",
  "details": "Invalid or expired token"
}

// 404 Not Found
{
  "error": "Not found",
  "details": "Routine not found"
}

// 500 Internal Server Error
{
  "error": "Internal server error",
  "details": "Database connection failed"
}
```

### Error Handling Example
```javascript
const apiCall = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

## React Native Implementation Examples

### Authentication Hook
```javascript
// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AuthService.getToken();
      if (token) {
        const profile = await getProfile();
        setUser(profile);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    const data = await signIn(email, password);
    if (data.access_token) {
      const profile = await getProfile();
      setUser(profile);
    }
    return data;
  };

  const signOut = async () => {
    await AuthService.removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### API Service Class
```javascript
// services/ApiService.js
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await AuthService.getAuthHeaders();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }

  // Profile methods
  getProfile() {
    return this.request('/api/profile');
  }

  updateProfile(profileData) {
    return this.request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Exercise methods
  getExercises() {
    return this.request('/api/exercises');
  }

  createExercise(exerciseData) {
    return this.request('/api/exercises', {
      method: 'POST',
      body: JSON.stringify(exerciseData)
    });
  }

  // Routine methods
  getRoutines(limit) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/api/routines${query}`);
  }

  createRoutine(routineData) {
    return this.request('/api/routines', {
      method: 'POST',
      body: JSON.stringify(routineData)
    });
  }

  // Workout methods
  getWorkouts() {
    return this.request('/api/workouts');
  }

  createWorkout(workoutData) {
    return this.request('/api/workouts', {
      method: 'POST',
      body: JSON.stringify(workoutData)
    });
  }

  getWorkoutHistory() {
    return this.request('/api/workouts/history');
  }

  // AI Chat methods
  sendChatMessage(message, generateRoutines = false) {
    return this.request('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt: message,
        generateRoutines
      })
    });
  }

  generateTTS(text, voice = 'fenrir', language = 'en-US') {
    return this.request('/api/generate-tts', {
      method: 'POST',
      body: JSON.stringify({
        prompt: text,
        voice,
        language
      })
    });
  }
}

export default new ApiService();
```

## Utility Functions

### BMI Calculation
```javascript
export const calculateBMI = (height, weight) => {
  if (!height || !weight) return null;
  
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  let category = '';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';
  
  return {
    value: Math.round(bmi * 10) / 10,
    category
  };
};
```

### Age Calculation
```javascript
export const calculateAge = (birthday) => {
  if (!birthday) return null;
  
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};
```

## Recent Updates & New Features

### 1. Notes and Rest Times
- **Routines**: Added `notes` and `rest_time_seconds` to routine exercises
- **Workouts**: Added `notes` and `rest_time_seconds` to workout exercises
- **AI Integration**: AI now generates notes and rest times automatically
- **UI Display**: Notes and rest times are displayed throughout the app with icons

### 2. Workout Duration
- **Flexible Input**: Accepts HH:MM:SS, minutes, or seconds
- **Database Storage**: Stored as string in `workouts.duration`
- **Display**: Formatted as "X hours Y minutes Z seconds"
- **API Support**: Both create and edit workout endpoints support duration

### 3. Enhanced Cardio Support
- **Exercise Type Detection**: Automatic detection of cardio vs strength exercises
- **Distance-Based Cardio**: Special handling for running, cycling, etc.
- **Dynamic UI**: Different input fields based on exercise type
- **Set Labels**: Shows "1 km", "Duration 1", or "Set 1" based on exercise type

### 4. AI Chat Improvements
- **Debug Mode**: Full AI response visible in debug view
- **Enhanced Prompts**: Strict requirements for integer reps and mandatory notes
- **Routine Generation**: Direct save to database from AI chat
- **Personalized Context**: AI receives user profile data for personalized advice

### 5. Database Schema Updates
- Added `duration` column to `workouts` table
- Added `notes` and `rest_time_seconds` to `routine_exercises` table
- Added `notes` and `rest_time_seconds` to `workout_exercises` table
- Added `rest_time_seconds` to `exercise_sets` table

## Security Considerations

1. **Token Storage**: Use `@react-native-async-storage/async-storage` for secure token storage
2. **HTTPS Only**: Always use HTTPS in production
3. **Token Refresh**: Implement automatic token refresh logic
4. **Input Validation**: Validate all user inputs before sending to API
5. **Error Handling**: Never expose sensitive error details to users

## Testing

### API Testing Example
```javascript
// __tests__/api.test.js
import ApiService from '../services/ApiService';

describe('API Service', () => {
  test('should get user profile', async () => {
    const profile = await ApiService.getProfile();
    expect(profile).toHaveProperty('id');
    expect(profile).toHaveProperty('email');
  });

  test('should create exercise', async () => {
    const exerciseData = {
      name: 'Test Exercise',
      description: 'Test description',
      muscle_group: 'chest'
    };
    
    const result = await ApiService.createExercise(exerciseData);
    expect(result).toHaveProperty('success', true);
  });

  test('should create workout with duration', async () => {
    const workoutData = {
      name: 'Test Workout',
      duration: '1:30:00',
      exercises: []
    };
    
    const result = await ApiService.createWorkout(workoutData);
    expect(result.workout).toHaveProperty('duration', '1:30:00');
  });
});
```

This documentation provides everything needed to build a React Native app that integrates with your FitApp backend. The backend handles user authentication, profile management, exercise/routine/workout CRUD operations with notes and rest times, flexible duration handling, cardio exercise detection, and AI-powered fitness coaching with personalized responses based on user data. 