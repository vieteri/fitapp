import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@/utils/supabase/server';
import { verifyJWT } from '@/utils/auth';

// Set maximum duration for this serverless function (25 seconds)
export const maxDuration = 25;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Mobile-optimized fitness expert system prompt for React Native
const fitnessSystemPrompt = `You are a knowledgeable fitness coach providing advice directly in a mobile fitness app.

FORMAT YOUR RESPONSES FOR MOBILE READABILITY:
- Use clear section headers with emojis (## 🏋️ Exercise Form)
- Break information into short, digestible paragraphs (2-3 sentences max)
- Use bullet points and numbered lists instead of tables
- Structure responses with clear hierarchy and white space
- Keep sentences short and direct
- Use line breaks frequently to prevent text walls

RESPONSE STRUCTURE:
Use this mobile-friendly format:

## 🎯 Quick Answer
Brief 1-2 sentence summary of the main point

## 💪 Key Points
• First important point with actionable advice
• Second key point with specific details
• Third point with practical tips

## 🔥 Action Steps
1. First step - be specific and clear
2. Second step - include timing/frequency
3. Third step - mention progression

## ⚠️ Safety Notes
• Important safety consideration
• Risk to avoid
• When to consult professionals

## 📈 Next Steps
Brief encouragement and what to do next

CONTENT GUIDELINES:
- Prioritize practical, actionable advice users can implement immediately
- Focus on proper form and technique first, then progression
- Include beginner, intermediate, and advanced options when relevant
- Use emojis sparingly but effectively for visual breaks
- Structure workout plans, nutrition advice, and form tips with clear sections
- Always prioritize safety
- For injuries/medical issues, recommend consulting healthcare professionals

TONE:
- Confident but approachable
- Motivating without using excessive hype
- Use conversational, direct language
- Write as if speaking directly to the user
- Keep paragraphs short and scannable

If users appear frustrated or discouraged, offer extra encouragement and simpler starting points.`;

const routineGenerationPrompt = `You are a professional fitness coach creating structured workout routines. Based on the available exercises provided, create workout routines that are balanced, effective, and safe.

ROUTINE CREATION GUIDELINES:
- Create balanced routines that work different muscle groups
- Include compound movements when possible
- Suggest appropriate sets, reps, and rest periods
- Consider exercise order (compound before isolation)
- Ensure routines are practical and achievable
- Include warm-up and cool-down recommendations

RESPONSE FORMAT:
When creating routines, respond with a JSON structure containing:
{
  "routines": [
    {
      "name": "Routine Name",
      "description": "Brief description of the routine's purpose, target goals, and what makes it effective",
      "exercises": [
        {
          "exercise_id": "uuid",
          "exercise_name": "Exercise Name",
          "sets": [
            {"reps": 10, "weight": null, "duration_minutes": null},
            {"reps": 10, "weight": null, "duration_minutes": null}
          ],
          "order_index": 0,
          "rest_seconds": 60,
          "notes": "Form tips, modifications, or technique cues"
        }
      ]
    }
  ],
  "explanation": "Brief explanation of the routine's benefits and how it fits the user's request"
}

CRITICAL REQUIREMENTS:
- ALWAYS use INTEGER numbers for "reps" field (e.g., 5, 8, 10, 12, 15, 20)
- NEVER use text like "as many as possible", "to failure", or "max reps"
- For exercises that are typically done to failure, use a reasonable target number (e.g., 15 for push-ups)
- For time-based exercises, set reps to null and use duration_minutes instead
- ALWAYS include "rest_seconds" field (typically 30-90 seconds between sets)
- ALWAYS include "notes" field with helpful form tips, modifications, or technique cues for each exercise
- NEVER leave "notes" or "rest_seconds" fields empty or undefined

Always provide practical, safe, and effective routines with clear descriptions.`;

// Simple timeout wrapper for AI calls only
const withAITimeout = (promise: Promise<any>, timeoutMs: number): Promise<any> => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`AI request timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

export async function POST(req: Request) {
  try {
    const { prompt, generateRoutines = false } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable is not set");
      return new Response(JSON.stringify({ error: "API configuration error" }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user is authenticated to get profile context
    let profileContext = "";
    let userProfile = null;
    let isAuthenticated = false;
    
    const authResult = await verifyJWT(req.headers.get('authorization'));
    if (!('error' in authResult)) {
      isAuthenticated = true;
      const { user, supabase } = authResult;
      
      // Fetch user's profile for context
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        userProfile = profile;
        const age = profile.birthday ? calculateAge(profile.birthday) : null;
        const bmi = (profile.height && profile.weight) ? calculateBMI(profile.height, profile.weight) : null;
        
        profileContext = `\n\nUSER PROFILE CONTEXT:
- Name: ${profile.full_name || 'Not provided'}
- Age: ${age ? `${age} years old` : 'Not provided'}
- Height: ${profile.height ? `${profile.height} cm` : 'Not provided'}
- Weight: ${profile.weight ? `${profile.weight} kg` : 'Not provided'}
- BMI: ${bmi ? `${bmi.value} (${bmi.category})` : 'Not calculated'}

Use this information to personalize your fitness advice. Consider their age, BMI category, and physical stats when making recommendations.`;
      }
    } else {
      // Log authentication error for debugging but don't fail the request for basic chat
      console.log('Authentication failed:', authResult.error, 'Code:', authResult.code);
    }

    // If this is a routine generation request, authentication is required
    if (generateRoutines) {
      if (!isAuthenticated) {
        return new Response(JSON.stringify({ 
          error: "Authentication required for routine generation. Please sign in to create personalized workout routines.",
          code: authResult.code || 'auth_required',
          requiresAuth: true
        }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const { user, supabase } = authResult as { user: any; supabase: any };

      // Fetch exercises with limit to prevent large datasets
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('id, name, description, muscle_group')
        .order('name')
        .limit(30); // Reduced limit to prevent timeout

      if (exercisesError) {
        console.error('Error fetching exercises:', exercisesError);
        return new Response(JSON.stringify({ 
          error: "Error fetching exercises: " + exercisesError.message 
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!exercises || exercises.length === 0) {
        return new Response(JSON.stringify({ 
          error: "No exercises available. Please contact support." 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Create enhanced prompt with available exercises
      const exerciseList = exercises?.map((ex: any) => 
        `- ${ex.name} (${ex.id}): ${ex.description} [${ex.muscle_group || 'General'}]`
      ).join('\n') || '';

      const enhancedPrompt = `${routineGenerationPrompt}${profileContext}

AVAILABLE EXERCISES:
${exerciseList}

USER REQUEST: ${prompt}

Please create 1 comprehensive workout routine using these exercises. Make sure to use exercise IDs from the list above. Consider the user's profile information when designing the routine.`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-lite-preview-06-17",
        generationConfig: {
          temperature: 0.7,
        }
      });
      
      // Add timeout to AI generation - increased to 60 seconds
      const result_ai = await withAITimeout(model.generateContent(enhancedPrompt), 60000);
      const text = await result_ai.response.text();
      
      console.log('🤖 Debug - Raw AI response:', text.substring(0, 1000) + '...');

      try {
        // Try multiple parsing strategies
        let routineData = null;
        
        // Strategy 1: Look for JSON in code blocks
        const codeBlockMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          console.log('Found JSON in code block:', codeBlockMatch[1].substring(0, 200));
          routineData = JSON.parse(codeBlockMatch[1]);
        } else {
          // Strategy 2: Look for raw JSON
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            console.log('Found raw JSON:', jsonMatch[0].substring(0, 200));
            routineData = JSON.parse(jsonMatch[0]);
          }
        }
        
        if (routineData && routineData.routines) {
          console.log('🤖 Debug - Parsed routine data before sanitization:', JSON.stringify(routineData, null, 2));
          
          // Validate and sanitize reps to ensure they are integers, and ensure notes/rest_seconds exist
          const sanitizedRoutines = routineData.routines.map((routine: any) => ({
            ...routine,
            exercises: routine.exercises.map((exercise: any) => ({
              ...exercise,
              // Ensure notes and rest_seconds are always present
              notes: exercise.notes || "Focus on proper form and controlled movement",
              rest_seconds: exercise.rest_seconds || 60,
              sets: exercise.sets.map((set: any) => ({
                ...set,
                reps: sanitizeReps(set.reps)
              }))
            }))
          }));

          console.log('🤖 Debug - Final sanitized routines being returned:', JSON.stringify(sanitizedRoutines, null, 2));
          console.log('Successfully parsed routines:', sanitizedRoutines.length);
          return new Response(JSON.stringify({ 
            response: text,
            routines: sanitizedRoutines,
            explanation: routineData.explanation,
            isRoutineGeneration: true
          }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (parseError) {
        console.error("JSON parsing failed:", parseError);
        console.log("Raw text sample:", text.substring(0, 500));
      }

      return new Response(JSON.stringify({ 
        response: text,
        isRoutineGeneration: true
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Regular chat response with profile context (works for both authenticated and unauthenticated users)
    const enhancedPrompt = `${fitnessSystemPrompt}${profileContext}\n\nUser question: ${prompt}`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
      }
    });
    
    // Add timeout to AI generation
    const result = await withAITimeout(model.generateContent(enhancedPrompt), 10000);
    const text = await result.response.text();

    return new Response(JSON.stringify({ 
      response: text,
      isAuthenticated 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error generating response:", error);
    
    // Handle timeout errors specifically
    if (error instanceof Error && error.message.includes('timed out')) {
      return new Response(JSON.stringify({ 
        error: "Request timed out. Please try again with a simpler request.",
        code: 'timeout'
      }), { 
        status: 504,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper function to sanitize reps to ensure they are integers
function sanitizeReps(reps: any): number | null {
  // If reps is already null, keep it null (for time-based exercises)
  if (reps === null || reps === undefined) {
    return null;
  }
  
  // If it's already a number, ensure it's an integer
  if (typeof reps === 'number') {
    return Math.max(1, Math.round(reps));
  }
  
  // If it's a string, try to parse it
  if (typeof reps === 'string') {
    // Handle common text patterns and convert to reasonable numbers
    const lowerReps = reps.toLowerCase();
    if (lowerReps.includes('failure') || lowerReps.includes('max') || lowerReps.includes('as many as possible')) {
      return 15; // Default for failure exercises
    }
    
    // Try to extract number from string
    const numMatch = reps.match(/\d+/);
    if (numMatch) {
      const parsedNum = parseInt(numMatch[0]);
      return Math.max(1, parsedNum);
    }
    
    // Default fallback
    return 10;
  }
  
  // Final fallback
  return 10;
}

// Helper function to calculate age from birthday
function calculateAge(birthday: string): number {
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Helper function to calculate BMI
function calculateBMI(height: number, weight: number): { value: number; category: string } {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  let category = '';
  if (bmi < 18.5) {
    category = 'Underweight';
  } else if (bmi < 25) {
    category = 'Normal weight';
  } else if (bmi < 30) {
    category = 'Overweight';
  } else {
    category = 'Obese';
  }
  
  return {
    value: Math.round(bmi * 10) / 10,
    category
  };
}
