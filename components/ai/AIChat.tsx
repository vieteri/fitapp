"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, Sparkles, Copy, CheckCircle, Dumbbell, Clock, Target, Save, Eye, Plus } from "lucide-react";
import { getAuthToken, authFetch } from "@/app/client-actions";
import { useAuth } from "@/context/auth-context";

interface ExerciseSet {
  reps: number;
  weight: number | null;
  duration_minutes: number | null;
}

interface RoutineExercise {
  exercise_id: string;
  exercise_name: string;
  sets: ExerciseSet[];
  order_index: number;
  rest_seconds?: number;
  notes?: string;
}

interface GeneratedRoutine {
  name: string;
  description: string;
  exercises: RoutineExercise[];
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isRoutineGeneration?: boolean;
  routines?: GeneratedRoutine[];
  explanation?: string;
}

export default function AIChat() {
  const [prompt, setPrompt] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savingRoutine, setSavingRoutine] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isRoutineGenerationRequest = (prompt: string): boolean => {
    const routineKeywords = [
      'routine', 'routines', 'workout plan', 'workout plans', 
      'create workout', 'create routine', 'workout program',
      'training plan', 'exercise plan', 'weekly workout'
    ];
    const lowerPrompt = prompt.toLowerCase();
    return routineKeywords.some(keyword => lowerPrompt.includes(keyword));
  };

  const isUserAuthenticated = (): boolean => {
    // Check if we're in the browser first
    if (typeof window === 'undefined') return false;
    
    const token = getAuthToken();
    return !!token && !!user;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || loading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentPrompt = prompt.trim();
    setPrompt("");
    setLoading(true);

    try {
      const isRoutineRequest = isRoutineGenerationRequest(currentPrompt);
      
      let res;
      if (isRoutineRequest && isUserAuthenticated()) {
        // Use authFetch for authenticated routine generation requests
        res = await authFetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt: currentPrompt,
            generateRoutines: true
          }),
        });
      } else if (isRoutineRequest && !isUserAuthenticated()) {
        // Handle routine request without authentication
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I'd love to help you create workout routines! However, to generate personalized routines based on your saved exercises, you'll need to sign in first. Once you're signed in, I can create custom routines using the exercises in your database and you'll be able to save them directly to your routine library. 💪\n\nFor now, I can still help you with general fitness advice, exercise form tips, and nutrition guidance!",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
        return;
      } else {
        // Use regular fetch for general chat
        res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt: currentPrompt,
            generateRoutines: false
          }),
        });
      }

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate response');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "Sorry, I couldn't generate a response. Please try again.",
        isUser: false,
        timestamp: new Date(),
        isRoutineGeneration: data.isRoutineGeneration,
        routines: data.routines,
        explanation: data.explanation
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("API Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : "Sorry, I'm having trouble connecting right now. Please check your connection and try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const saveRoutine = async (routine: GeneratedRoutine) => {
    const routineId = `${routine.name}-${Date.now()}`;
    setSavingRoutine(routineId);

    try {
      if (!isUserAuthenticated()) {
        alert('Please sign in to save routines');
        return;
      }

      const routineData = {
        name: routine.name,
        description: routine.description,
        exercises: routine.exercises.map(ex => ({
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          order_index: ex.order_index
        }))
      };

      const res = await authFetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(routineData)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save routine');
      }

      alert(`Routine "${routine.name}" saved successfully!`);
    } catch (error) {
      console.error('Error saving routine:', error);
      alert(error instanceof Error ? error.message : 'Failed to save routine');
    } finally {
      setSavingRoutine(null);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const RoutinePreview = ({ routine, onSave }: { routine: GeneratedRoutine; onSave: () => void }) => (
    <Card className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">{routine.name}</CardTitle>
          </div>
          <Button
            onClick={onSave}
            disabled={savingRoutine === `${routine.name}-${Date.now()}`}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            {savingRoutine === `${routine.name}-${Date.now()}` ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save Routine
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{routine.description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {routine.exercises.map((exercise, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    #{exercise.order_index + 1}
                  </Badge>
                  <span className="font-medium">{exercise.exercise_name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    <span>{exercise.sets.length} sets</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Reps: {exercise.sets.map(s => s.reps).join(', ')}</span>
                  </div>
                  {exercise.rest_seconds && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{exercise.rest_seconds}s rest</span>
                    </div>
                  )}
                </div>
                {exercise.notes && (
                  <p className="text-xs text-muted-foreground mt-1 italic">{exercise.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-[600px] bg-gray-50 dark:bg-gray-900/50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Welcome to your AI Fitness Coach!
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              I&apos;m here to help you with workouts, nutrition, form tips, and all your fitness questions. What would you like to know?
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge 
                variant="secondary" 
                className={`cursor-pointer transition-colors ${
                  isUserAuthenticated() 
                    ? "hover:bg-blue-100 dark:hover:bg-blue-900" 
                    : "opacity-50 cursor-not-allowed"
                }`}
                onClick={() => {
                  if (isUserAuthenticated()) {
                    setPrompt("Create 3 workout routines for me that I could do weekly");
                  } else {
                    alert("Please sign in to generate workout routines");
                  }
                }}
              >
                <Dumbbell className="h-3 w-3 mr-1" />
                Workout Routines {!isUserAuthenticated() && "(Sign in required)"}
              </Badge>
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                onClick={() => setPrompt("How do I improve my squat form?")}
              >
                Exercise Form
              </Badge>
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                onClick={() => setPrompt("What should I eat for muscle building?")}
              >
                Nutrition Advice
              </Badge>
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors"
                onClick={() => setPrompt("How often should I workout?")}
              >
                Training Frequency
              </Badge>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div className={`flex gap-3 max-w-[90%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isUser 
                  ? 'bg-gradient-to-br from-green-500 to-green-600' 
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}>
                {message.isUser ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'}`}>
                <Card className={`p-4 ${
                  message.isUser 
                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-400' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}>
                  <div className={`prose prose-sm max-w-none ${
                    message.isUser 
                      ? 'prose-invert' 
                      : 'prose-gray dark:prose-invert'
                  }`}>
                    {message.isUser ? (
                      <p className="mb-0 text-white">{message.content}</p>
                    ) : (
                      <div 
                        dangerouslySetInnerHTML={{ __html: message.content }} 
                        className="[&>*:last-child]:mb-0"
                      />
                    )}
                  </div>
                  
                  {!message.isUser && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Sparkles className="h-3 w-3" />
                        <span>{message.isRoutineGeneration ? 'AI Routine Generator' : 'AI Response'}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => copyToClipboard(message.content, message.id)}
                      >
                        {copiedId === message.id ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}
                </Card>
                
                {/* Routine Previews */}
                {message.routines && message.routines.length > 0 && (
                  <div className="w-full mt-4 space-y-4">
                    {message.explanation && (
                      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-4">
                          <p className="text-sm text-green-800 dark:text-green-200">{message.explanation}</p>
                        </CardContent>
                      </Card>
                    )}
                    {message.routines.map((routine, idx) => (
                      <RoutinePreview 
                        key={idx} 
                        routine={routine} 
                        onSave={() => saveRoutine(routine)}
                      />
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground mt-1 px-2">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start mb-4">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white dark:bg-gray-800 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about fitness, workouts, nutrition, or health..."
              className="min-h-[44px] max-h-32 resize-none pr-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <div className="absolute right-2 top-2 text-xs text-muted-foreground">
              {prompt.length}/2000
            </div>
          </div>
          <Button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line • Try asking for &quot;workout routines&quot; to get structured plans!
        </div>
      </div>
    </div>
  );
}
