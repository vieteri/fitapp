"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, Sparkles, Copy, CheckCircle, Dumbbell, Clock, Target, Save, Eye, Plus, ChevronDown, ChevronUp, Bug, Edit3, MessageSquare } from "lucide-react";
import { getAuthToken, authFetch } from "@/app/client-actions";
import { useAuth } from "@/context/auth-context";
import { TableRenderer } from "./table-renderer";
import { isCardioExercise, getSetLabel, isDistanceBasedCardio } from "@/utils/utils";

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
  rawResponse?: any; // Store the full API response for debugging
}

export default function AIChat() {
  const [prompt, setPrompt] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savingRoutine, setSavingRoutine] = useState<string | null>(null);
  const [expandedDebug, setExpandedDebug] = useState<string | null>(null);
  const [editingRoutineNote, setEditingRoutineNote] = useState<string | null>(null);
  const [routineNotes, setRoutineNotes] = useState<{[key: string]: string}>({});
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
      } else if (isRoutineRequest) {
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

      // Debug logging
      console.log('=== FULL API RESPONSE ===');
      console.log('Response data:', JSON.stringify(data, null, 2));
      console.log('Has routines:', !!data.routines);
      console.log('Routines array:', data.routines);
      console.log('Is routine generation:', data.isRoutineGeneration);
      console.log('Response error:', data.error);
      console.log('Response content sample:', data.response?.substring(0, 200));
      
      // Check if routines have notes
      if (data.routines && data.routines.length > 0) {
        console.log('🔍 First routine from API:', JSON.stringify(data.routines[0], null, 2));
        console.log('🔍 First exercise from API:', JSON.stringify(data.routines[0].exercises[0], null, 2));
        console.log('🔍 First exercise notes:', data.routines[0].exercises[0]?.notes);
        console.log('🔍 First exercise rest_seconds:', data.routines[0].exercises[0]?.rest_seconds);
      }
      console.log('========================');

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "Sorry, I couldn't generate a response. Please try again.",
        isUser: false,
        timestamp: new Date(),
        isRoutineGeneration: data.isRoutineGeneration,
        routines: data.routines,
        explanation: data.explanation,
        rawResponse: data // Store full response for debugging
      };

      // If this is a new routine generation, clear old routine generation messages to avoid confusion
      if (data.isRoutineGeneration && data.routines && data.routines.length > 0) {
        setMessages(prev => prev.filter(msg => !msg.isRoutineGeneration));
      }

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

  const saveRoutine = async (routine: GeneratedRoutine, customNotes?: string) => {
    const routineId = `${routine.name}-${Date.now()}`;
    setSavingRoutine(routineId);

    console.log('🚨 CRITICAL DEBUG - Routine object passed to saveRoutine:', JSON.stringify(routine, null, 2));
    console.log('🚨 CRITICAL DEBUG - First exercise from routine:', JSON.stringify(routine.exercises[0], null, 2));

    try {
      if (!isUserAuthenticated()) {
        alert('Please sign in to save routines');
        return;
      }

      // Combine original description with custom notes
      const finalDescription = customNotes 
        ? `${routine.description}\n\n**Personal Notes:** ${customNotes}`
        : routine.description;

      const routineData = {
        name: routine.name,
        description: finalDescription,
        exercises: routine.exercises.map(ex => {
          console.log('🔍 Processing exercise for save:', ex.exercise_name || ex.exercise_id, 'Notes:', ex.notes, 'Rest:', ex.rest_seconds);
          return {
            exercise_id: ex.exercise_id,
            sets: ex.sets,
            order_index: ex.order_index,
            rest_seconds: ex.rest_seconds || 60, // Default to 60 seconds if not specified
            notes: ex.notes || "Focus on proper form and controlled movement" // Always include notes with fallback
          };
        })
      };

      console.log('🚀 Debug - Saving routine data:', JSON.stringify(routineData, null, 2));
      console.log('🚀 Debug - Original routine from AI:', JSON.stringify(routine, null, 2));
      console.log('🚀 Debug - Routine name being saved:', routine.name);
      console.log('🚀 Debug - Number of exercises:', routine.exercises.length);
      console.log('🚀 Debug - First exercise details:', JSON.stringify(routine.exercises[0], null, 2));

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

  const RoutinePreview = ({ routine, onSave }: { routine: GeneratedRoutine; onSave: (notes?: string) => void }) => {
    const routineKey = `${routine.name}-${Date.now()}`;
    const isEditing = editingRoutineNote === routineKey;
    const currentNotes = routineNotes[routineKey] || '';
    
    console.log('🔄 RoutinePreview - Routine received:', JSON.stringify(routine, null, 2));
    console.log('🔄 RoutinePreview - First exercise notes:', routine.exercises[0]?.notes);
    console.log('🔄 RoutinePreview - First exercise rest_seconds:', routine.exercises[0]?.rest_seconds);
    
    // Simple cardio detection based on exercise names
    const isCardioByName = (exerciseName: string): boolean => {
      const cardioKeywords = ['running', 'cycling', 'rowing', 'jump rope', 'burpees', 'mountain climbers', 'jumping jacks', 'cardio', 'treadmill', 'bike', 'elliptical'];
      return cardioKeywords.some(keyword => exerciseName.toLowerCase().includes(keyword));
    };
    
    return (
      <Card className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <CardTitle className="text-base sm:text-lg">{routine.name}</CardTitle>
              {routine.exercises.some(ex => ex.notes || ex.rest_seconds) && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Enhanced
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingRoutineNote(isEditing ? null : routineKey);
                }}
                className="text-blue-600 border-blue-200 hover:bg-blue-100 text-xs sm:text-sm"
              >
                <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">{isEditing ? 'Cancel' : 'Add Notes'}</span>
                <span className="sm:hidden">{isEditing ? 'Cancel' : 'Notes'}</span>
              </Button>
              <Button
                onClick={() => onSave(currentNotes)}
                disabled={savingRoutine === routineKey}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                size="sm"
              >
                {savingRoutine === routineKey ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1" />
                ) : (
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                )}
                <span className="hidden sm:inline">Save Routine</span>
                <span className="sm:hidden">Save</span>
              </Button>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            <TableRenderer content={routine.description} />
          </div>
          
          {/* Notes Section */}
          {isEditing && (
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add notes about this routine:
              </label>
              <Textarea
                value={currentNotes}
                onChange={(e) => setRoutineNotes(prev => ({ ...prev, [routineKey]: e.target.value }))}
                placeholder="e.g., Focus on form, adjust weights based on strength level, good for beginners..."
                className="min-h-[80px] text-sm"
              />
            </div>
          )}
          
          {currentNotes && !isEditing && (
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes:</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{currentNotes}</div>
            </div>
          )}
        </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-1 sm:px-3 font-medium text-gray-900 dark:text-gray-100">#</th>
                <th className="text-left py-2 px-1 sm:px-3 font-medium text-gray-900 dark:text-gray-100">Exercise</th>
                <th className="text-left py-2 px-1 sm:px-3 font-medium text-gray-900 dark:text-gray-100">Sets</th>
                <th className="text-left py-2 px-1 sm:px-3 font-medium text-gray-900 dark:text-gray-100">Reps</th>
                <th className="text-left py-2 px-1 sm:px-3 font-medium text-gray-900 dark:text-gray-100">Rest</th>
                <th className="text-left py-2 px-1 sm:px-3 font-medium text-gray-900 dark:text-gray-100 hidden sm:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {routine.exercises.map((exercise, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-2 sm:py-3 px-1 sm:px-3">
                    <Badge variant="outline" className="text-xs">
                      {exercise.order_index + 1}
                    </Badge>
                  </td>
                  <td className="py-2 sm:py-3 px-1 sm:px-3 font-medium text-gray-900 dark:text-gray-100">
                    <div className="leading-tight">
                      {exercise.exercise_name}
                      {/* Show notes on mobile in a condensed way */}
                      {exercise.notes && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:hidden">
                          {exercise.notes.length > 30 ? `${exercise.notes.substring(0, 30)}...` : exercise.notes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 px-1 sm:px-3 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>{exercise.sets.length}</span>
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 px-1 sm:px-3 text-gray-600 dark:text-gray-400">
                    <div className="leading-tight">
                      {isCardioByName(exercise.exercise_name) ? (
                        isDistanceBasedCardio(exercise.exercise_name) ? (
                          // Distance-based cardio: show distance first, then duration
                          exercise.sets.map(s => {
                            const parts = [];
                            if (s.duration_minutes) parts.push(`${s.duration_minutes}km`);
                            if (s.reps) parts.push(`${s.reps}min`);
                            return parts.join(' / ') || `${s.reps || 0} reps`;
                          }).join(', ')
                        ) : (
                          // Time-based cardio: show duration first, then reps
                          exercise.sets.map(s => {
                            const parts = [];
                            if (s.duration_minutes) parts.push(`${s.duration_minutes}min`);
                            if (s.reps) parts.push(`${s.reps} reps`);
                            return parts.join(' / ') || `${s.reps || 0} reps`;
                          }).join(', ')
                        )
                      ) : (
                        // For strength, show reps normally
                        exercise.sets.map(s => s.reps).join(', ')
                      )}
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 px-1 sm:px-3 text-gray-600 dark:text-gray-400">
                    {exercise.rest_seconds ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{exercise.rest_seconds}s</span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-2 sm:py-3 px-1 sm:px-3 text-xs text-gray-500 dark:text-gray-400 max-w-48 hidden sm:table-cell">
                    {exercise.notes ? (
                      <div className="truncate">
                        <TableRenderer content={exercise.notes} />
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
    );
  };

  return (
    <div className="flex flex-col h-[600px] sm:h-[600px] h-[calc(100vh-8rem)] bg-gray-50 dark:bg-gray-900/50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Welcome to your AI Fitness Coach!
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto px-4">
              I&apos;m here to help you with workouts, nutrition, form tips, and all your fitness questions. What would you like to know?
            </p>
            <div className="flex flex-wrap gap-2 justify-center px-4">
              <Badge 
                variant="secondary" 
                className={`cursor-pointer transition-colors text-xs sm:text-sm py-1 px-2 sm:px-3 ${
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
                className="cursor-pointer hover:bg-green-100 dark:hover:bg-green-900 transition-colors text-xs sm:text-sm py-1 px-2 sm:px-3"
                onClick={() => setPrompt("How do I improve my squat form?")}
              >
                Exercise Form
              </Badge>
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors text-xs sm:text-sm py-1 px-2 sm:px-3"
                onClick={() => setPrompt("What should I eat for muscle building?")}
              >
                Nutrition Advice
              </Badge>
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors text-xs sm:text-sm py-1 px-2 sm:px-3"
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
            <div className={`flex gap-2 sm:gap-3 max-w-[95%] sm:max-w-[90%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isUser 
                  ? 'bg-gradient-to-br from-green-500 to-green-600' 
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}>
                {message.isUser ? (
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                ) : (
                  <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'}`}>
                <Card className={`p-3 sm:p-4 ${
                  message.isUser 
                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-400' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}>
                  <div className={`prose prose-sm max-w-none text-sm sm:text-base ${
                    message.isUser 
                      ? 'prose-invert' 
                      : 'prose-gray dark:prose-invert'
                  }`}>
                    {message.isUser ? (
                      <p className="mb-0 text-white leading-relaxed">{message.content}</p>
                    ) : (
                      // Only show the main response if it's not a routine generation or if there are no routines
                      !message.isRoutineGeneration || !message.routines || message.routines.length === 0 ? (
                        <TableRenderer content={message.content} />
                      ) : (
                        <div className="text-sm text-muted-foreground italic">
                          ✨ Generated {message.routines.length} personalized workout routine{message.routines.length > 1 ? 's' : ''} for you!
                        </div>
                      )
                    )}
                  </div>
                  
                  {!message.isUser && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Sparkles className="h-3 w-3" />
                        <span className="hidden sm:inline">{message.isRoutineGeneration ? 'AI Routine Generator' : 'AI Response'}</span>
                        <span className="sm:hidden">AI</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setExpandedDebug(expandedDebug === message.id ? null : message.id)}
                          title="Toggle debug view"
                        >
                          <Bug className="h-3 w-3" />
                          {expandedDebug === message.id ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                        </Button>
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
                    </div>
                  )}
                </Card>
                
                {/* Debug View */}
                {!message.isUser && expandedDebug === message.id && message.rawResponse && (
                  <Card className="mt-2 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Bug className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Debug: Full AI Response</span>
                      </div>
                      <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto bg-gray-50 dark:bg-gray-900 p-3 rounded border">
                        {JSON.stringify(message.rawResponse, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
                
                {/* Routine Previews */}
                {message.routines && message.routines.length > 0 && (
                  <div className="w-full mt-4 space-y-4">
                    {message.explanation && (
                      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-4">
                          <div className="text-sm text-green-800 dark:text-green-200">
                            <TableRenderer content={message.explanation} />
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {message.routines.map((routine, idx) => (
                      <RoutinePreview 
                        key={idx} 
                        routine={routine} 
                        onSave={(notes) => saveRoutine(routine, notes)}
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
      <div className="border-t bg-white dark:bg-gray-800 p-3 sm:p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about fitness, workouts, nutrition..."
              className="min-h-[48px] sm:min-h-[44px] max-h-32 resize-none pr-12 sm:pr-16 text-sm sm:text-base bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
              disabled={loading}
            />
            <div className="absolute right-2 top-2 text-xs sm:text-sm text-muted-foreground">
              {prompt.length}/2000
            </div>
          </div>
          <Button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-3 sm:px-4 min-h-[48px] sm:min-h-[44px]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>
        </form>
        <div className="text-xs sm:text-sm text-muted-foreground mt-2 text-center leading-relaxed">
          <span className="block sm:inline">Press Enter to send, Shift+Enter for new line</span>
          <span className="hidden sm:inline"> • </span>
          <span className="block sm:inline">Try asking for "workout routines" to get structured plans!</span>
        </div>
      </div>
    </div>
  );
}
