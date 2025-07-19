# AI Fitness Coach TTS Demo

## Quick Start Guide

### 1. Setup
Ensure you have your Gemini API key configured:
```bash
GEMINI_API_KEY=your_api_key_here
```

### 2. Access the TTS Chat
- Navigate to `http://localhost:3000/chat/tts`
- Or click "Try Voice Chat" from the main chat page

### 3. Example Interactions

#### Beginner Workout Questions:
```
"I'm new to fitness. Can you create a simple 20-minute workout routine for me?"
```

#### Form and Technique:
```
"How do I perform a proper deadlift? I want to make sure I don't hurt my back."
```

#### Nutrition Advice:
```
"What should I eat before and after a workout to maximize my results?"
```

#### Specific Exercise Help:
```
"I'm having trouble with push-ups. Can you give me some modifications for beginners?"
```

### 4. Voice Features

#### Voice Selection:
- Use the dropdown to select your preferred voice
- English voices are filtered for better fitness coaching experience
- Try different voices to find what works best for you

#### Audio Controls:
- Responses automatically play as audio
- Click the volume button to replay or stop audio
- Audio is optimized for clear instruction delivery

### 5. Tips for Best Experience

#### Question Types That Work Well:
- Exercise form and technique questions
- Workout routine requests
- Nutrition and recovery advice
- Equipment recommendations
- Injury prevention tips

#### Optimal Usage:
- Use during rest periods between sets
- Great for learning new exercises
- Perfect for home workout guidance
- Helpful for motivation and encouragement

### 6. Technical Features

#### Browser Compatibility:
- Works in all modern browsers
- No additional plugins required
- Uses native Web Speech API

#### Performance:
- Fast text generation with Gemini 2.0 Flash
- Immediate audio playback
- Optimized for mobile and desktop

## Sample Conversation Flow

1. **User**: "How do I start strength training safely?"

2. **AI Response** (with audio): "Great question! Starting strength training safely is crucial for long-term success. Begin with bodyweight exercises like squats, push-ups, and planks to build a foundation. Focus on proper form over heavy weights. Start with two to three sessions per week, allowing rest days for recovery. Always warm up with light cardio and dynamic stretching before lifting..."

3. **User**: "What's the best way to warm up?"

4. **AI Response** (with audio): "An effective warm-up should last five to ten minutes and include light cardio followed by dynamic movements. Start with marching in place or light jogging, then add arm circles, leg swings, and bodyweight squats. This increases blood flow to your muscles and prepares your joints for exercise..."

## Troubleshooting

### No Audio Playing:
- Check if your browser supports Web Speech API
- Ensure system volume is up
- Try refreshing the page
- Select a different voice from the dropdown

### Poor Voice Quality:
- Try different voices in the selection dropdown
- Some system voices are higher quality than others
- Consider using headphones for better audio experience

### API Errors:
- Verify your Gemini API key is correctly set
- Check your internet connection
- Try refreshing the page and asking again 