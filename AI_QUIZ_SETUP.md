# AI Quiz Generator Setup

## Overview
The AI Quiz Generator feature allows users to create personalized quizzes on any topic using Alith AI integration. Users can specify:
- Custom topics
- Difficulty levels (Beginner, Intermediate, Advanced)
- Number of questions (3, 5, 7, or 10)

## Environment Setup

### Required Environment Variables
Create a `.env` file in the project root with:

```bash
# OpenAI API Key for AI Quiz Generation
OPENAI_API_KEY=your_openai_api_key_here
```

### Getting an OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the key (starts with `sk-proj-` or `sk-`)
5. Add it to your `.env` file

## Features Implemented

✅ **AI Quiz Generator Service** (`src/libs/aiQuizGenerator.ts`)
- Uses Alith AI to generate custom quiz questions
- Validates quiz structure and content
- Encodes quiz data for URL passing

✅ **AI Quiz Generator UI** (`src/components/AIQuizGenerator.tsx`)
- Interactive form for quiz customization
- Popular topic suggestions
- Difficulty and question count selection
- Loading states and error handling

✅ **Home Page Integration** (`src/routes/index.tsx`)
- AI Quiz Generator section added above predefined quizzes
- Seamless integration with existing design

✅ **Quiz Game Support** (`src/routes/quiz-game.tsx`)
- Handles AI-generated quiz data from URL parameters
- Special UI indicators for AI-generated content
- Full compatibility with existing quiz mechanics

## How It Works

1. **User Input**: User enters topic, selects difficulty and question count
2. **AI Generation**: Alith AI generates questions based on user preferences
3. **URL Encoding**: Quiz data is base64 encoded and passed via URL
4. **Quiz Display**: Quiz game renders AI-generated content with special UI
5. **Blockchain Integration**: Same reward mechanics as predefined quizzes

## URL Structure

AI-generated quizzes use this URL format:
```
/quiz-game?quiz=ai-custom&data=<base64-encoded-quiz-data>
```

## Example Usage

1. Navigate to the home page
2. Click "Create Custom Quiz" in the AI Quiz Generator section
3. Enter a topic like "Bitcoin basics" or "DeFi lending"
4. Select difficulty and question count
5. Click "Generate AI Quiz"
6. Play the personalized quiz and earn rewards!

## Technical Details

- **Frontend-only**: No backend API needed
- **Real-time Generation**: Quizzes created on-demand
- **Shareable URLs**: Generated quizzes can be shared via URL
- **Blockchain Compatible**: Works with existing smart contract rewards
- **Error Handling**: Graceful fallbacks for API failures

## Troubleshooting

**"OPENAI_API_KEY environment variable is not set"**
- Ensure your `.env` file exists in the project root
- Verify the API key is correctly formatted
- Restart your development server after adding the key

**"Failed to generate quiz"**
- Check your internet connection
- Verify your OpenAI API key has credits
- Try a simpler or different topic

**"Invalid quiz data"**
- This usually indicates a URL tampering issue
- Generate a new quiz instead of manually editing URLs

