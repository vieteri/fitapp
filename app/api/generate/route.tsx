import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@/utils/supabase/server';
import { verifyJWT } from '@/utils/auth';

// Set maximum duration for this serverless function (25 seconds)
export const maxDuration = 25;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Mobile-optimized fitness expert system prompt for React Native
const fitnessSystemPrompt = `You are a knowledgeable fitness coach providing advice directly in a mobile fitness app.

FORMAT YOUR RESPONSES IN TABULAR FORM:
- Always structure information using tables with clear headers
- Use ASCII table format (| Column 1 | Column 2 | Column 3 |)
- Keep responses concise but comprehensive
- Use tables for exercise plans, nutrition info, form tips, etc.
- Add brief explanatory text before and after tables when needed

RESPONSE STRUCTURE:
Present information in organized tables such as:

| Category | Details | Notes |
|----------|---------|-------|
| Main Point | Key takeaway | Why it matters |
| Action Steps | Specific instructions | Implementation tips |
| Safety | Important considerations | Risk mitigation |

CONTENT GUIDELINES:
- Prioritize practical, actionable advice users can implement immediately
- Focus on proper form and technique first, then progression
- Include beginner, intermediate, and advanced options when relevant
- Use tables to compare exercises, show progressions, list alternatives
- Structure workout plans, nutrition advice, and form tips in tabular format
- Always prioritize safety
- For injuries/medical issues, recommend consulting healthcare professionals

TONE:
- Confident but approachable
- Motivating without using excessive hype
- Use conversational, direct language
- Write as if speaking directly to the user

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
      "description": "Brief description of the routine with tabular workout summary:\n\n| Exercise | Sets | Reps | Rest | Notes |\n|----------|------|------|------|-------|\n| Exercise 1 | 3 | 10-12 | 60s | Form tips |\n| Exercise 2 | 3 | 8-10 | 90s | Modifications |",
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
          "notes": "Form tips or modifications in tabular format when helpful"
        }
      ]
    }
  ],
  "explanation": "Brief explanation with tabular comparison of routines:\n\n| Routine | Focus | Duration | Difficulty |\n|---------|-------|----------|------------|\n| Routine 1 | Strength | 45min | Beginner |\n| Routine 2 | Cardio | 30min | Intermediate |"
}

Always provide practical, safe, and effective routines with tabular summaries for easy comparison.`;

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
          console.log('Successfully parsed routines:', routineData.routines?.length);
          return new Response(JSON.stringify({ 
            response: text,
            routines: routineData.routines,
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
