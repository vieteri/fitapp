import AIChat from "@/components/ai/AIChat";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, MessageCircle, Sparkles, Mic, Zap, Brain } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-3/4 -right-4 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-300/10 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Fitness Coach
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get personalized fitness advice, workout plans, and nutrition guidance from your AI-powered fitness companion
          </p>
          <Badge variant="secondary" className="mt-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by Gemini AI
          </Badge>
        </div>
        
        {/* Chat Method Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Text Chat Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm border-white/20 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Text Chat
              </CardTitle>
              <p className="text-muted-foreground">
                Traditional text-based conversation with instant responses
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span>Instant responses</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                  <span>Easy to reference</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span>Detailed explanations</span>
                </div>
              </div>
              <div className="pt-4">
                <div className="text-sm text-muted-foreground mb-2">Perfect for:</div>
                <div className="text-sm space-y-1">
                  <div>• Workout planning</div>
                  <div>• Exercise form questions</div>
                  <div>• Nutrition advice</div>
                  <div>• Progress tracking</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice Chat Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm border-white/20 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Volume2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Voice Chat
              </CardTitle>
              <p className="text-muted-foreground">
                Natural voice conversations with audio responses
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mic className="h-4 w-4 text-green-600" />
                  <span>Voice input & output</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Volume2 className="h-4 w-4 text-blue-600" />
                  <span>Hands-free interaction</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span>Natural conversation</span>
                </div>
              </div>
              <div className="pt-4">
                <div className="text-sm text-muted-foreground mb-2">Perfect for:</div>
                <div className="text-sm space-y-1">
                  <div>• During workouts</div>
                  <div>• Quick questions</div>
                  <div>• Hands-free guidance</div>
                  <div>• Audio learning</div>
                </div>
              </div>
              <Link href="/chat/tts" className="block pt-2">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Try Voice Chat
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Chat Interface */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Chat with Your AI Fitness Coach
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Ask anything about fitness, nutrition, workouts, and health
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <AIChat />
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Pro Tips for Better Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Be specific:</strong> &quot;Create a 3-day upper body routine for beginners&quot; gets better results than &quot;workout plan&quot;
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Include your goals:</strong> Mention if you want to build muscle, lose weight, or improve endurance
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Ask follow-ups:</strong> &quot;Can you modify this for home workouts?&quot; or &quot;What about nutrition?&quot;
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Mention limitations:</strong> Include any injuries, time constraints, or equipment availability
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Track progress:</strong> Share your current stats and progress for personalized advice
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>Ask for explanations:</strong> &quot;Why is this exercise good for me?&quot; helps you learn
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
