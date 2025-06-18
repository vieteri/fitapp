"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings2, Calendar, Ruler, Weight, Activity } from 'lucide-react';
import Link from 'next/link';
import type { Tables } from '@/types/supabase-types';

type Profile = Tables<'profiles'> & { email: string };

export function ProfileSettings({ profile }: { profile: Profile | null }) {
  if (!profile) return null;

  // Format birthday for display
  const formatBirthday = (birthday: string | null) => {
    if (!birthday) return null;
    const date = new Date(birthday);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate age from birthday
  const calculateAge = (birthday: string | null) => {
    if (!birthday) return null;
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate BMI
  const calculateBMI = (height: number | null, weight: number | null) => {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    let category = '';
    let categoryColor = '';
    if (bmi < 18.5) {
      category = 'Underweight';
      categoryColor = 'text-blue-600';
    } else if (bmi < 25) {
      category = 'Normal';
      categoryColor = 'text-green-600';
    } else if (bmi < 30) {
      category = 'Overweight';
      categoryColor = 'text-yellow-600';
    } else {
      category = 'Obese';
      categoryColor = 'text-red-600';
    }
    
    return {
      value: Math.round(bmi * 10) / 10,
      category,
      categoryColor
    };
  };

  const age = calculateAge(profile.birthday);
  const formattedBirthday = formatBirthday(profile.birthday);
  const bmi = calculateBMI(profile.height, profile.weight);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{profile.full_name || 'User'}</h1>
          <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
        </div>
        <Link href="/profile/edit">
          <Button variant="outline" size="sm">
            <Settings2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Birthday */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Calendar className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium">Birthday</p>
            {formattedBirthday ? (
              <div>
                <p className="text-sm text-muted-foreground">{formattedBirthday}</p>
                {age && <Badge variant="secondary" className="text-xs mt-1">{age} years old</Badge>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not set</p>
            )}
          </div>
        </div>

        {/* Height */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Ruler className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium">Height</p>
            <p className="text-sm text-muted-foreground">
              {profile.height ? `${profile.height} cm` : 'Not set'}
            </p>
          </div>
        </div>

        {/* Weight */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Weight className="h-5 w-5 text-purple-600" />
          <div>
            <p className="text-sm font-medium">Weight</p>
            <p className="text-sm text-muted-foreground">
              {profile.weight ? `${profile.weight} kg` : 'Not set'}
            </p>
          </div>
        </div>

        {/* BMI */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Activity className="h-5 w-5 text-orange-600" />
          <div>
            <p className="text-sm font-medium">BMI</p>
            {bmi ? (
              <div>
                <p className="text-sm text-muted-foreground">{bmi.value}</p>
                <Badge variant="secondary" className={`text-xs mt-1 ${bmi.categoryColor}`}>
                  {bmi.category}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not calculated</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
} 