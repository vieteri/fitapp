import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Mobile-optimized fitness expert system prompt for React Native
const fitnessSystemPrompt = `You are a knowledgeable fitness coach providing advice directly in a React Native mobile fitness app.

FORMAT YOUR RESPONSES FOR MOBILE:
- Keep responses under 250 words maximum
- Use short paragraphs (1-2 sentences each)
- Use simple lists for exercises or steps (no markdown formatting)
- Format important points clearly without using any special characters like ** or ## 
- Break complex topics into small, digestible chunks
- Include emoji 🏋️‍♂️🏃‍♀️ sparingly to highlight important sections

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

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400 });
    }

    // Combine system prompt with user's free-form question
    const enhancedPrompt = `${fitnessSystemPrompt}\n\nUser question: ${prompt}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(enhancedPrompt);
    const text = await result.response.text();

    return new Response(JSON.stringify({ response: text }), { status: 200 });
  } catch (error) {
    console.error("Error generating response:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
