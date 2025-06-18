"use client";

import AITTSChat from "@/components/ai/ai-tts-chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Volume2, Languages } from "lucide-react";
import { useState, useEffect } from "react";

export default function TTSChatPage() {
  const [allVoices, setAllVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        setAllVoices(voices);
      };

      loadVoices();
      speechSynthesis.addEventListener('voiceschanged', loadVoices);

      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  const groupedVoices = allVoices.reduce((acc, voice) => {
    const lang = voice.lang.split('-')[0]; // Get language code without region
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(voice);
    return acc;
  }, {} as Record<string, SpeechSynthesisVoice[]>);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Voice Chat</h1>
        <p className="text-muted-foreground">
          Chat with your AI fitness coach using voice commands and get spoken responses.
        </p>
      </div>

      {/* Voice Debug Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Voice Debug Info
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Check available voices and languages on your system
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setShowDebug(!showDebug)}
            variant="outline"
            className="mb-4"
          >
            {showDebug ? 'Hide' : 'Show'} All Available Voices ({allVoices.length})
          </Button>
          
          {showDebug && (
            <div className="space-y-4">
              <div className="text-sm">
                <strong>Available Languages:</strong> {Object.keys(groupedVoices).sort().join(', ')}
              </div>
              
              <div className="max-h-64 overflow-y-auto border rounded p-4 bg-muted/50">
                {Object.entries(groupedVoices)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([lang, voices]) => (
                    <div key={lang} className="mb-3">
                      <div className="font-semibold text-sm mb-1">
                        {lang.toUpperCase()} ({voices.length} voices)
                      </div>
                      <div className="text-xs space-y-1 ml-2">
                        {voices.map((voice, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{voice.name}</span>
                            <span className="text-muted-foreground">
                              {voice.lang} {voice.localService ? '(Local)' : '(Remote)'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="text-xs text-muted-foreground">
                Finnish voices would appear as &quot;fi&quot; or &quot;fi-FI&quot; in the language list above.
                If you don&apos;t see &quot;fi&quot; in the available languages, Finnish voices are not installed on your system.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Chat
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Click the microphone to start speaking, or type your message.
          </p>
        </CardHeader>
        <CardContent>
          <AITTSChat />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            How to Use
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>Voice Input:</strong> Click the microphone button and speak your fitness question</p>
          <p>• <strong>Text Input:</strong> Type your message in the text area</p>
          <p>• <strong>Voice Selection:</strong> Choose from available voices in the dropdown</p>
          <p>• <strong>Auto-play:</strong> AI responses are automatically spoken aloud</p>
          <p>• <strong>Control:</strong> Use stop/pause buttons to control speech playback</p>
        </CardContent>
      </Card>
    </div>
  );
} 