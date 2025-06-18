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
```

### Routines
```typescript
interface Routine {
  id: string;
  name: string;
  description: string | null;
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
  created_at: string | null;
  updated_at: string | null;
}
```

### Workouts
```typescript
interface Workout {
  id: string;
  name: string;
  description: string | null;
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
  created_at: string;
}
```

## API Endpoints

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

### Exercise Management

#### Get All Exercises
```javascript
const getExercises = async () => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/exercises`);
  return response.json();
};
```

#### Get Exercise by ID
```javascript
const getExercise = async (id) => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/exercises/${id}`);
  return response.json();
};
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

#### Create Routine
```javascript
const createRoutine = async (routineData) => {
  const headers = await AuthService.getAuthHeaders();
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/routines`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: routineData.name,
      description: routineData.description,
      exercises: routineData.exercises.map(ex => ({
        exercise_id: ex.exerciseId,
        sets: ex.sets, // Array of {reps, weight, duration_minutes}
        order_index: ex.orderIndex
      }))
    })
  });
  return response.json();
};
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

#### Create Workout
```javascript
const createWorkout = async (workoutData) => {
  const headers = await AuthService.getAuthHeaders();
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/workouts`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: workoutData.name,
      description: workoutData.description
    })
  });
  return response.json();
};
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
    sets: Array<{
      reps: number;
      weight: number | null;
      duration_minutes: number | null;
    }>;
    order_index: number;
    rest_seconds?: number;
    notes?: string;
  }[];
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

## Error Handling

### Standard Error Response
```typescript
interface ErrorResponse {
  error: string;
  details?: string;
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found
- `500`: Internal Server Error

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
});
```

This documentation provides everything needed to build a React Native app that integrates with your FitApp backend. The backend handles user authentication, profile management, exercise/routine/workout CRUD operations, and AI-powered fitness coaching with personalized responses based on user data. 