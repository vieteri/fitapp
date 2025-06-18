"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, VolumeX, Loader2, Mic, Square } from "lucide-react";
import { toast } from "sonner";

interface TTSResponse {
  text: string;
  audio: any;
  audioMimeType?: string;
  message?: string;
  hasNativeAudio?: boolean;
}

interface GeminiVoice {
  id: string;
  name: string;
  description: string;
  language: string;
  gender: string;
}

export default function AITTSChat() {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<string>("puck");
  const [geminiVoices, setGeminiVoices] = useState<GeminiVoice[]>([]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);
  const recognition = useRef<any>(null);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  // Load Gemini voices
  useEffect(() => {
    const loadGeminiVoices = async () => {
      try {
        const response = await fetch('/api/gemini-voices');
        const data = await response.json();
        if (data.voices) {
          setGeminiVoices(data.voices);
        }
      } catch (error) {
        console.error('Failed to load Gemini voices:', error);
      }
    };
    
    loadGeminiVoices();
  }, []);

  // Initialize speech synthesis and recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesis.current = window.speechSynthesis;
      
      // Load available voices
      const loadVoices = () => {
        const voices = speechSynthesis.current?.getVoices() || [];
        setAvailableVoices(voices);
      };

      loadVoices();
      speechSynthesis.current?.addEventListener('voiceschanged', loadVoices);

      // Initialize speech recognition if available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = false;
        recognition.current.interimResults = false;
        recognition.current.lang = 'en-US';

        recognition.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setPrompt(transcript);
          setIsListening(false);
        };

        recognition.current.onerror = () => {
          setIsListening(false);
          toast.error("Speech recognition error occurred");
        };

        recognition.current.onend = () => {
          setIsListening(false);
        };
      }

      return () => {
        speechSynthesis.current?.removeEventListener('voiceschanged', loadVoices);
        if (currentUtterance.current) {
          speechSynthesis.current?.cancel();
        }
      };
    }
  }, []);

  // Set default voice to Grandma (Finnish) when voices are loaded
  useEffect(() => {
    const filteredVoices = availableVoices.filter(voice => 
      voice.lang.startsWith('en') || voice.lang === 'en-US' ||
      voice.lang.startsWith('fi') || voice.lang === 'fi'
    ).sort((a, b) => {
      if (a.name.includes('Grandma') && a.lang.startsWith('fi')) return -1;
      if (b.name.includes('Grandma') && b.lang.startsWith('fi')) return 1;
      return 0;
    }).slice(0, 5);

    // Set default to Grandma if available, otherwise keep current selection
    if (filteredVoices.length > 0 && selectedVoice === "0") {
      const grandmaIndex = filteredVoices.findIndex(voice => 
        voice.name.includes('Grandma') && voice.lang.startsWith('fi')
      );
      if (grandmaIndex >= 0) {
        setSelectedVoice(grandmaIndex.toString());
      }
    }
  }, [availableVoices, selectedVoice]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a question or use voice input");
      return;
    }
    
    setLoading(true);
    setResponse(null);
    stopSpeaking();

    try {
      // Get the selected voice to determine language
      const filteredVoices = availableVoices.filter(voice => 
        voice.lang.startsWith('en') || voice.lang === 'en-US' ||
        voice.lang.startsWith('fi') || voice.lang === 'fi'
      ).sort((a, b) => {
        if (a.name.includes('Grandma') && a.lang.startsWith('fi')) return -1;
        if (b.name.includes('Grandma') && b.lang.startsWith('fi')) return 1;
        return 0;
      }).slice(0, 5);

      const selectedVoiceObj = filteredVoices[parseInt(selectedVoice)];
      const voiceLanguage = selectedVoiceObj?.lang || 'en-US';
      
      console.log("Sending request:", { prompt: prompt.trim(), language: voiceLanguage });
      
      const res = await fetch("/api/generate-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: prompt.trim(),
          voice: selectedVoice,
          language: voiceLanguage
        }),
      });

      console.log("Response status:", res.status);
      
      if (!res.ok) {
        // Handle non-JSON error responses
        let errorMessage = `HTTP ${res.status}: Failed to generate response`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, try to get text response
          try {
            const errorText = await res.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.error("Could not parse error response:", textError);
          }
        }
        throw new Error(errorMessage);
      }
      
      const data: TTSResponse = await res.json();
      console.log("Response data:", data);

      setResponse(data.text || "No response generated");
      
      if (data.message) {
        toast.info(data.message);
      }

      // Auto-play the response
      setTimeout(() => {
        if (data.audio && data.audioMimeType) {
          // Play Gemini-generated audio
          playGeminiAudio(data.audio, data.audioMimeType);
        } else {
          // Fallback to browser TTS
          speakText(data.text);
        }
      }, 500);

    } catch (error) {
      console.error("API Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch response";
      setResponse(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (!speechSynthesis.current || !text) return;

    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get the best available voice (prioritize premium/neural voices)
    const voice = getBestVoice() || filteredVoices[parseInt(selectedVoice)] || filteredVoices[0];
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      toast.error("Speech synthesis error occurred");
    };

    currentUtterance.current = utterance;
    speechSynthesis.current.speak(utterance);
  };

  // Get the highest quality voice available
  const getBestVoice = () => {
    const allVoices = speechSynthesis.current?.getVoices() || [];
    
    // Get the selected voice to determine language preference
    const selectedVoiceObj = filteredVoices[parseInt(selectedVoice)];
    const isFinish = selectedVoiceObj?.lang?.startsWith('fi');
    
    // If Finnish is selected, prioritize Finnish voices
    if (isFinish) {
      const finnishVoices = allVoices.filter(voice => 
        voice.lang.startsWith('fi') && voice.localService
      );
      if (finnishVoices.length > 0) {
        // Look for premium Finnish voices
        const premiumFinnish = finnishVoices.find(v => 
          v.name.includes('Premium') || 
          v.name.includes('Neural') ||
          v.name.includes('Enhanced') ||
          v.name.includes('Grandma')
        );
        return premiumFinnish || finnishVoices[0];
      }
    }
    
    // For English, prioritize high-quality voices
    const englishVoices = allVoices.filter(voice => 
      voice.lang.startsWith('en') && voice.localService
    );
    
    // Look for premium/neural voices first
    const premiumVoice = englishVoices.find(voice => 
      voice.name.includes('Premium') || 
      voice.name.includes('Neural') ||
      voice.name.includes('Enhanced') ||
      voice.name.includes('Natural')
    );
    
    return premiumVoice || englishVoices[0] || selectedVoiceObj;
  };

  const stopSpeaking = () => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
      setIsPlaying(false);
    }
  };

  const startListening = () => {
    if (recognition.current && !isListening) {
      setIsListening(true);
      recognition.current.start();
      toast.info("Listening... Speak your question");
    }
  };

  const stopListening = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
      setIsListening(false);
    }
  };

  const playGeminiAudio = (audioBase64: string, mimeType: string) => {
    try {
      // Convert base64 to blob
      const audioBytes = atob(audioBase64);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }
      const audioBlob = new Blob([audioArray], { type: mimeType });
      
      // Create audio element and play
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        toast.error("Error playing Gemini audio");
      };
      
      audio.play();
    } catch (error) {
      console.error("Error playing Gemini audio:", error);
      toast.error("Failed to play Gemini audio");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  // Filter voices to show English and Finnish voices, prioritize Grandma
  const filteredVoices = availableVoices.filter(voice => 
    voice.lang.startsWith('en') || voice.lang === 'en-US' ||
    voice.lang.startsWith('fi') || voice.lang === 'fi'
  ).sort((a, b) => {
    // Put Grandma (Finnish) first
    if (a.name.includes('Grandma') && a.lang.startsWith('fi')) return -1;
    if (b.name.includes('Grandma') && b.lang.startsWith('fi')) return 1;
    return 0;
  }).slice(0, 5);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <Volume2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Fitness Coach
        </h1>
        <p className="text-muted-foreground">
          Get personalized workout advice with premium AI voices
        </p>
      </div>

      {/* Main Chat Interface */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardContent className="p-6 space-y-6">
        {/* Gemini Voice Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Choose Your AI Voice
            </label>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {geminiVoices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 ${
                  selectedVoice === voice.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${
                    selectedVoice === voice.id ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{voice.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{voice.description}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <span className="text-xs text-gray-500 capitalize">{voice.gender}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {geminiVoices.length === 0 && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-sm text-muted-foreground">Loading premium voices...</span>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about workouts, exercises, form tips, or nutrition..."
              className="min-h-[120px] resize-none pr-16 border-2 focus:border-blue-500 rounded-2xl text-base placeholder:text-gray-400"
              disabled={loading || isListening}
            />
            
            {/* Voice Input Button */}
            {recognition.current && (
              <Button
                variant={isListening ? "destructive" : "secondary"}
                size="icon"
                onClick={isListening ? stopListening : startListening}
                disabled={loading}
                className={`absolute bottom-3 right-3 rounded-full w-10 h-10 transition-all duration-200 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                }`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim() || isListening}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Response...
              </>
            ) : (
              <>
                <Volume2 className="mr-2 h-5 w-5" />
                Get AI Fitness Advice
              </>
            )}
          </Button>
          
          {response && (
            <Button
              variant={isPlaying ? "destructive" : "secondary"}
              size="icon"
              onClick={isPlaying ? stopSpeaking : () => speakText(response)}
              className={`h-12 w-12 rounded-xl transition-all duration-200 ${
                isPlaying 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
              }`}
              title={isPlaying ? "Stop speaking" : "Play audio"}
            >
              {isPlaying ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          )}
        </div>

        {/* Response Section */}
        {response && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Volume2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">AI Fitness Coach</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  {response.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3 last:mb-0 text-gray-700 dark:text-gray-300 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Indicators */}
        {isListening && (
          <div className="flex items-center justify-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              🎤 Listening for your question...
            </span>
          </div>
        )}

        {isPlaying && (
          <div className="flex items-center justify-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
            <Volume2 className="h-4 w-4 text-green-600 animate-pulse" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              🔊 Playing AI response...
            </span>
          </div>
        )}

        {/* Usage Tips */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs">💡</span>
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Quick Tips</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Ask about exercise form, workout routines, or nutrition advice</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Choose from premium AI voices with unique personalities</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Use voice input for hands-free interaction during workouts</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Press Enter to submit or click the mic for voice input</span>
            </div>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
} 