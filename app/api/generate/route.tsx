import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@/utils/supabase/server';
import { verifyJWT } from '@/utils/auth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Mobile-optimized fitness expert system prompt for React Native
const fitnessSystemPrompt = `You are a knowledgeable fitness coach providing advice directly in a mobile fitness app.

FORMAT YOUR RESPONSES FOR MAXIMUM READABILITY:
- Keep responses under 200 words maximum
- Use short paragraphs (1-2 sentences each) with line breaks between them
- Structure information with clear sections using emojis as headers
- Use bullet points with dashes (-) for lists
- Add spacing between different topics
- No markdown formatting (**, ##, etc.)
- Use simple, conversational language

RESPONSE STRUCTURE:
🎯 Main Point: Start with the key takeaway
📋 Details: Provide specific, actionable steps
💡 Pro Tip: Include one helpful bonus tip
⚠️ Safety: Mention any important safety considerations (when relevant)

CONTENT GUIDELINES:
- Prioritize practical, actionable advice users can implement immediately
- Focus on proper form and technique first, then progression
- Include beginner, intermediate, and advanced options when relevant
- Suggest alternatives for people without gym equipment
- Mention time-efficient workout options (5-15 minutes) for busy people
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
      "description": "Brief description of the routine",
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
          "notes": "Form tips or modifications"
        }
      ]
    }
  ],
  "explanation": "Brief explanation of why these routines work well together"
}

Always provide practical, safe, and effective routines based on the available exercises.`;

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
    
    const authResult = await verifyJWT(req.headers.get('authorization'));
    if (!('error' in authResult)) {
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
    }

    // If this is a routine generation request, handle it differently
    if (generateRoutines) {
      if ('error' in authResult) {
        return new Response(JSON.stringify({ error: authResult.error }), { 
          status: authResult.status,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const { user, supabase } = authResult;

      // Fetch user's exercises
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (exercisesError) {
        return new Response(JSON.stringify({ error: "Error fetching exercises" }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Create enhanced prompt with available exercises
      const exerciseList = exercises?.map(ex => 
        `- ${ex.name} (${ex.id}): ${ex.description} [${ex.muscle_group || 'General'}]`
      ).join('\n') || '';

      const enhancedPrompt = `${routineGenerationPrompt}${profileContext}

AVAILABLE EXERCISES:
${exerciseList}

USER REQUEST: ${prompt}

Please create 3 different workout routines using these exercises. Make sure to use exercise IDs from the list above. Consider the user's profile information when designing the routines.`;

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result_ai = await model.generateContent(enhancedPrompt);
      const text = await result_ai.response.text();

      try {
        // Try to parse as JSON first
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const routineData = JSON.parse(jsonMatch[0]);
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
        // If JSON parsing fails, return as regular text
        console.log("Could not parse JSON, returning as text");
      }

      return new Response(JSON.stringify({ 
        response: text,
        isRoutineGeneration: true
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Regular chat response with profile context
    const enhancedPrompt = `${fitnessSystemPrompt}${profileContext}\n\nUser question: ${prompt}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(enhancedPrompt);
    const text = await result.response.text();

    return new Response(JSON.stringify({ response: text }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error generating response:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
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
