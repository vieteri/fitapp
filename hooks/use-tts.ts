"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  voiceIndex?: number;
}

export interface UseTTSReturn {
  isPlaying: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  speak: (text: string, options?: TTSOptions) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

export function useTTS(): UseTTSReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.current = window.speechSynthesis;
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = speechSynthesis.current?.getVoices() || [];
        // Filter for English and Finnish voices
        const filteredVoices = availableVoices.filter(voice => 
          voice.lang.startsWith('en-') || voice.lang === 'en' || 
          voice.lang.startsWith('fi-') || voice.lang === 'fi'
        );
        
        // Sort to put Grandma (Finnish) first, then limit to 5
        const sortedVoices = filteredVoices.sort((a, b) => {
          if (a.name.includes('Grandma') && a.lang.startsWith('fi')) return -1;
          if (b.name.includes('Grandma') && b.lang.startsWith('fi')) return 1;
          return 0;
        }).slice(0, 5);
        
        setVoices(sortedVoices);
      };

      // Load voices immediately and on voiceschanged event
      loadVoices();
      speechSynthesis.current.addEventListener('voiceschanged', loadVoices);

      return () => {
        speechSynthesis.current?.removeEventListener('voiceschanged', loadVoices);
        if (currentUtterance.current) {
          speechSynthesis.current?.cancel();
        }
      };
    }
  }, []);

  const speak = useCallback((text: string, options: TTSOptions = {}) => {
    if (!speechSynthesis.current || !text.trim()) {
      if (!speechSynthesis.current) {
        toast.error("Speech synthesis not supported in this browser");
      }
      return;
    }

    // Stop any current speech
    speechSynthesis.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply options
    utterance.rate = options.rate ?? 0.9;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;
    utterance.lang = options.lang ?? 'en-US';

    // Set voice if specified
    if (options.voiceIndex !== undefined && voices[options.voiceIndex]) {
      utterance.voice = voices[options.voiceIndex];
    } else {
      // Try to find Grandma (Finnish) voice first, then fallback to other voices
      const grandmaVoice = voices.find(voice => 
        voice.name.includes('Grandma') && voice.lang.startsWith('fi')
      );
      
      const fallbackVoice = voices.find(voice => 
        (voice.lang.startsWith('en') || voice.lang.startsWith('fi')) && voice.localService
      ) || voices.find(voice => voice.lang.startsWith('en') || voice.lang.startsWith('fi'));
      
      const selectedVoice = grandmaVoice || fallbackVoice;
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    // Set up event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      currentUtterance.current = null;
    };

    utterance.onerror = (event) => {
      setIsPlaying(false);
      currentUtterance.current = null;
      console.error('Speech synthesis error:', event.error);
      toast.error(`Speech error: ${event.error}`);
    };

    utterance.onpause = () => {
      setIsPlaying(false);
    };

    utterance.onresume = () => {
      setIsPlaying(true);
    };

    currentUtterance.current = utterance;
    speechSynthesis.current.speak(utterance);
  }, [voices]);

  const stop = useCallback(() => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
      setIsPlaying(false);
      currentUtterance.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    if (speechSynthesis.current && speechSynthesis.current.speaking) {
      speechSynthesis.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (speechSynthesis.current && speechSynthesis.current.paused) {
      speechSynthesis.current.resume();
    }
  }, []);

  return {
    isPlaying,
    isSupported,
    voices,
    speak,
    stop,
    pause,
    resume,
  };
} 