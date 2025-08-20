// backend/index.ts

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { streamText, generateObject } from 'ai'
import { z } from 'zod'
import { Agent } from 'alith'
import 'dotenv/config'

// Initialize the app
const app = new Hono()

// Configure CORS for localhost development
app.use(
  '*',
  cors({
    origin: process.env.NODE_ENV === 'production' ? ['*'] : ['http://localhost:3000', 'http://localhost:5173'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

// Welcome message
const welcomeStrings = [
  "Hello Hono!",
  "To learn more about Hono on Vercel, visit https://vercel.com/docs/frameworks/hono ",
]

// Root endpoint
app.get('/', (c) => {
  return c.text(welcomeStrings.join('\n\n'))
})

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

// Get random info endpoint
app.get('/random-info', async (c) => {
  try {
    // Use the AI Gateway by specifying the model creator and name
    const result = await streamText({
      model: 'cerebras/qwen-3-32b',
      prompt: 'Generate a random interesting fact about technology, science, or history.',
    })

    // Convert stream to text
    let content = '';
    for await (const textPart of result.textStream) {
      content += textPart;
    }

    return c.json({
      info: content,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching random info:', error)
    return c.json({
      error: 'Failed to generate random information',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// Quiz data endpoint
app.get('/quiz', async (c) => {
  try {
    // Define schema for quiz data
    const QuizSchema = z.object({
      questions: z.array(
        z.object({
          question: z.string(),
          options: z.array(z.string()),
          correctAnswer: z.number().int().min(0),
          explanation: z.string().optional()
        })
      )
    })

    // Generate quiz data using the AI Gateway
    const { object } = await generateObject({
      model: 'cerebras/qwen-3-32b',
      schema: QuizSchema,
      prompt: 'Generate a quiz with 3 questions about web development. Each question should have 4 multiple choice options, indicate the correct answer with its index (0-3), and include a brief explanation.'
    })

    return c.json({
      quiz: object,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating quiz:', error)
    return c.json({
      error: 'Failed to generate quiz data',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// AI Quiz Generation endpoint using Alith + Groq
app.post('/generate-ai-quiz', async (c) => {
  try {
    // Check if Groq API key is available
    if (!process.env.GROQ_API_KEY) {
      return c.json({
        error: 'Groq API key not configured on server',
        timestamp: new Date().toISOString()
      }, 500)
    }

    // Parse request body
    const body = await c.req.json()
    const { topic, difficulty, questionCount, userInterests } = body

    // Validate input
    if (!topic || !difficulty || !questionCount) {
      return c.json({
        error: 'Missing required fields: topic, difficulty, questionCount',
        timestamp: new Date().toISOString()
      }, 400)
    }

    // Initialize Alith agent with Groq
    const agent = new Agent({
      model: "llama3-70b-8192",
      apiKey: process.env.GROQ_API_KEY,
      baseUrl: "https://api.groq.com/openai/v1",
    })

    // Create the quiz generation prompt
    const prompt = `Create a ${difficulty} level quiz about "${topic}" with exactly ${questionCount} questions.

Requirements:
- Each question should have exactly 4 multiple choice options
- Only one correct answer per question
- Include a brief explanation for each correct answer
- Questions should be educational and test understanding
- Difficulty level: ${difficulty}
${userInterests && userInterests.length > 0 ? `- Consider these user interests: ${userInterests.join(', ')}` : ''}

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no extra text.

Format your response as this exact JSON structure:
{
  "title": "Quiz title based on the topic",
  "description": "Brief description of what this quiz covers",
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of why this answer is correct"
    }
  ]
}

IMPORTANT JSON RULES:
- Use double quotes for all strings
- Ensure all array elements are properly separated with commas
- Do not use any escape characters in option text
- Keep option text simple and avoid quotes within quotes
- The "correct" field should be a number (0, 1, 2, or 3)

Topic: ${topic}
Number of questions: ${questionCount}
Difficulty: ${difficulty}

Return only the JSON object:`

    console.log('🤖 Generating AI quiz with Groq + Alith...')
    
    // Generate quiz using Alith with Groq
    const response = await agent.prompt(prompt)
    
    console.log('✅ Quiz generated successfully')

    // Try to parse the JSON response
    let quizData
    try {
      // Clean up the JSON string - just trim and remove potential markdown
      let jsonStr = response.trim()
      
      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```') && jsonStr.endsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
      }
      
      console.log('Cleaned JSON string:', jsonStr.substring(0, 500) + '...')
      
      quizData = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError)
      console.error('Raw AI response:', response.substring(0, 1000))
      
      return c.json({
        error: 'Failed to parse AI-generated quiz data. AI response was malformed.',
        details: parseError instanceof Error ? parseError.message : 'JSON parsing failed',
        rawResponse: response.substring(0, 500),
        timestamp: new Date().toISOString()
      }, 500)
    }

    // Validate the quiz structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      return c.json({
        error: 'Invalid quiz format generated',
        timestamp: new Date().toISOString()
      }, 500)
    }

    // Add quiz metadata
    const quizConfig = {
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: quizData.title || `${topic} Quiz`,
      description: quizData.description || `A ${difficulty} level quiz about ${topic}`,
      difficulty,
      topic,
      questionCount: quizData.questions.length,
      questions: quizData.questions.map((q: any, index: number) => ({
        question: q.question,
        options: q.options || [],
        correct: q.correct || 0,
        explanation: q.explanation || 'No explanation provided'
      })),
      createdAt: new Date().toISOString(),
      source: 'ai-generated-groq'
    }

    return c.json({
      success: true,
      quiz: quizConfig,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error generating AI quiz:', error)
    return c.json({
      error: 'Failed to generate AI quiz',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

export default app