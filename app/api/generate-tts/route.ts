import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Fitness-focused system prompt optimized for TTS
const fitnessSystemPromptTTS = `You are an encouraging fitness coach providing audio guidance for workouts.

AUDIO-OPTIMIZED GUIDELINES:
- Keep responses under 200 words for optimal audio length
- Use natural, conversational language that sounds good when spoken
- Include clear pauses with periods and commas
- Avoid complex punctuation or special characters
- Use "and" instead of "&" 
- Spell out numbers (say "ten reps" not "10 reps")
- Include motivational phrases naturally in the flow
- Use simple, clear sentences that are easy to follow while exercising

CONTENT FOCUS:
- Provide workout instructions with proper form cues
- Give motivational encouragement during exercises
- Offer quick fitness tips and advice
- Include breathing reminders for exercises
- Suggest modifications for different fitness levels

TONE FOR AUDIO:
- Enthusiastic but not overly energetic
- Clear and easy to understand
- Supportive and encouraging
- Professional yet friendly
- Use natural speech patterns

Remember: This will be converted to audio, so prioritize clarity and natural speech flow over written formatting.`;

export async function POST(request: Request) {
  try {
    const { prompt, voice = "puck", language } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable is not set");
      return NextResponse.json({ error: "API configuration error" }, { status: 500 });
    }

    console.log('TTS Request:', { prompt: prompt.substring(0, 50) + '...', voice, language });

    // Determine if we should respond in Finnish
    const isFinish = language === 'fi' || language?.startsWith('fi-');
    
    // Finnish system prompt for TTS
    const finnishSystemPromptTTS = `Olet kannustava kuntovalmentaja, joka antaa ääniohjauksia treeneille.

ÄÄNELLE OPTIMOIDUT OHJEET:
- Pidä vastaukset alle 200 sanassa optimaalista äänipituutta varten
- Käytä luonnollista, keskustelevaa kieltä joka kuulostaa hyvältä puhuttuna
- Sisällytä selkeitä taukoja pisteillä ja pilkuilla
- Vältä monimutkaista välimerkkejä tai erikoismerkkejä
- Käytä "ja" ei "&" merkkiä
- Kirjoita numerot sanoina (sano "kymmenen toistoa" ei "10 toistoa")
- Sisällytä motivoivia lauseita luonnollisesti tekstiin
- Käytä yksinkertaisia, selkeitä lauseita joita on helppo seurata treenaessa

SISÄLLÖN PAINOPISTEET:
- Anna treeniohjeita oikealla tekniikalla
- Kannusta motivoivasti harjoitusten aikana
- Tarjoa nopeita kuntovinkkejä ja neuvoja
- Sisällytä hengitysmuistutuksia harjoituksiin
- Ehdota muunnoksia eri kuntotasoille

ÄÄNELLE SOPIVA SÄVY:
- Innostunut mutta ei liian energinen
- Selkeä ja helposti ymmärrettävä
- Tukeva ja kannustava
- Ammattimainen mutta ystävällinen
- Käytä luonnollisia puheen rytmejä

Muista: Tämä muunnetaan ääneksi, joten priorisoi selkeyttä ja luonnollista puheen sujuvuutta kirjoitetun muotoilun sijaan.`;

        // Choose system prompt based on language
    const systemPrompt = isFinish ? finnishSystemPromptTTS : fitnessSystemPromptTTS;
    
    // Combine system prompt with user's question
    const enhancedPrompt = `${systemPrompt}\n\nUser question: ${prompt}`;

    // Try different Gemini models that support audio generation
    const modelsToTry = [
      "gemini-2.0-flash-exp",
      "gemini-2.0-flash-thinking-exp-1219", 
      "gemini-exp-1206",
      "gemini-2.0-flash"
    ];
    
    let audioData = null;
    let text = "";
    let modelUsed = "";
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName}`);
        
        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        
        const requestBody = {
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voice
                }
              }
            }
          }
        };
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
          try {
            const data = await response.json();
            console.log(`${modelName} success! Response:`, JSON.stringify(data, null, 2));
            
            // Extract audio data
            if (data.candidates?.[0]?.content?.parts) {
              for (const part of data.candidates[0].content.parts) {
                if (part.inlineData?.mimeType?.startsWith('audio/')) {
                  audioData = part.inlineData.data;
                  modelUsed = modelName;
                  text = "Audio response generated by Gemini";
                  break;
                }
              }
            }
            
            if (audioData) break; // Found working model with audio
          } catch (parseError) {
            console.log(`${modelName} JSON parse error:`, parseError);
            const errorText = await response.text();
            console.log(`${modelName} response text:`, errorText);
          }
        } else {
          try {
            const errorData = await response.json();
            console.log(`${modelName} failed:`, response.status, errorData);
          } catch (parseError) {
            const errorText = await response.text();
            console.log(`${modelName} failed:`, response.status, errorText);
          }
        }
      } catch (error) {
        console.log(`${modelName} error:`, error);
        continue;
      }
    }
    
    // If no audio was generated, fall back to text generation
    if (!audioData) {
      console.log("No models supported audio, falling back to text generation");
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(enhancedPrompt);
      text = await result.response.text();
      modelUsed = "gemini-2.0-flash (text only)";
    }
    
    return NextResponse.json({
      text,
      audio: audioData,
      audioMimeType: audioData ? "audio/wav" : null,
      message: `Generated with ${modelUsed}${audioData ? ' (with native audio)' : ' (using browser TTS)'}`,
      hasNativeAudio: !!audioData
    });

  } catch (error) {
    console.error("Error generating TTS response:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate response";
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined 
      },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 