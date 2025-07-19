import { NextResponse } from 'next/server';

// Gemini's available voices (based on documentation)
const GEMINI_VOICES = [
  {
    id: 'puck',
    name: 'Puck',
    description: 'Conversational, friendly voice',
    language: 'en-US',
    gender: 'neutral'
  },
  {
    id: 'charon',
    name: 'Charon',
    description: 'Deep, authoritative voice',
    language: 'en-US', 
    gender: 'masculine'
  },
  {
    id: 'kore',
    name: 'Kore',
    description: 'Warm, nurturing voice',
    language: 'en-US',
    gender: 'feminine'
  },
  {
    id: 'fenrir',
    name: 'Fenrir',
    description: 'Energetic, motivational voice',
    language: 'en-US',
    gender: 'masculine'
  },
  {
    id: 'aoede',
    name: 'Aoede',
    description: 'Melodic, expressive voice',
    language: 'en-US',
    gender: 'feminine'
  }
];

export async function GET() {
  try {
    return NextResponse.json({
      voices: GEMINI_VOICES,
      message: "Available Gemini voices for TTS generation"
    });
  } catch (error) {
    console.error('Error fetching Gemini voices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voices' },
      { status: 500 }
    );
  }
} 