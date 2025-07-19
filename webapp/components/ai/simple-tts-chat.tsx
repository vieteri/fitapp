"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, VolumeX, Loader2, Mic } from "lucide-react";
import { toast } from "sonner";
import { useTTS } from "@/hooks/use-tts";

interface TTSResponse {
  text: string;
  audio: any;
  message?: string;
}

export default function SimpleTTSChat() {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  
  const { isPlaying, isSupported, voices, speak, stop } = useTTS();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    setLoading(true);
    setResponse(null);
    stop(); // Stop any current speech

    try {
      const res = await fetch("/api/generate-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data: TTSResponse = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to generate response");
      }

      setResponse(data.text || "No response generated");
      
      if (data.message) {
        toast.info(data.message);
      }

      // Auto-play the response after a short delay
      setTimeout(() => {
        if (data.text) {
          speak(data.text, { voiceIndex: selectedVoiceIndex });
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handlePlayResponse = () => {
    if (response) {
      if (isPlaying) {
        stop();
      } else {
        speak(response, { voiceIndex: selectedVoiceIndex });
      }
    }
  };

  // Filter to English voices for better fitness coaching
  const englishVoices = voices.filter(voice => 
    voice.lang.startsWith('en')
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          AI Fitness Coach with Voice
          {!isSupported && (
            <span className="text-sm text-destructive font-normal">
              (TTS not supported)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Selection */}
        {isSupported && englishVoices.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Voice Selection:</label>
            <Select 
              value={selectedVoiceIndex.toString()} 
              onValueChange={(value) => setSelectedVoiceIndex(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {englishVoices.map((voice, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {voice.name} ({voice.lang})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Input Section */}
        <div className="space-y-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about workouts, exercises, form tips, or nutrition..."
            className="min-h-[100px] resize-none"
            disabled={loading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Get Fitness Advice"
            )}
          </Button>
          
          {response && isSupported && (
            <Button
              variant={isPlaying ? "destructive" : "outline"}
              size="icon"
              onClick={handlePlayResponse}
              title={isPlaying ? "Stop speaking" : "Play audio"}
            >
              {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Response Section */}
        {response && (
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2 mb-2">
                <Volume2 className="h-4 w-4 mt-1 text-primary" />
                <span className="text-sm font-medium">Fitness Coach:</span>
              </div>
              <div className="prose dark:prose-invert max-w-none text-sm">
                {response.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-2 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Indicators */}
        {isPlaying && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Volume2 className="h-4 w-4" />
            Playing audio response...
          </div>
        )}

        {/* Usage Tips */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 <strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Ask about exercise form, workout routines, or nutrition advice</li>
            <li>Press Enter to submit your question quickly</li>
            <li>Audio will automatically play after generating response</li>
            <li>Use different voices to find your preference</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 