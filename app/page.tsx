"use client";

import { Button } from "@/components/ui/button";
import { DumbbellIcon, BarChart3Icon, ClockIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center gap-8 px-4">
        <h1 className="text-4xl sm:text-6xl font-bold max-w-3xl">
          Track Your Fitness Journey with <span className="text-primary">FitTrack</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Log workouts, track progress, and achieve your fitness goals with our easy-to-use workout tracker.
        </p>
        <div className="flex gap-4 justify-center">
          {user ? (
            <Link href="/workouts">
              <Button size="lg" className="gap-2">
                <DumbbellIcon size={20} />
                View Workouts
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Link href="/sign-in">
                <Button size="lg" className="min-w-[200px]">Get Started</Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                Free to use. No credit card required.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-8 px-4">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <DumbbellIcon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Track Workouts</h3>
          <p className="text-muted-foreground">
            Log your exercises, sets, reps, and weights with ease
          </p>
        </div>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <BarChart3Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Monitor Progress</h3>
          <p className="text-muted-foreground">
            Visualize your improvements and track personal records
          </p>
        </div>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ClockIcon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Stay Consistent</h3>
          <p className="text-muted-foreground">
            Build habits with workout streaks and reminders
          </p>
        </div>
      </div>
    </div>
  );
}
