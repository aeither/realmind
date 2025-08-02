import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { streamText } from 'ai'
import { createCerebras } from '@ai-sdk/cerebras'

// Initialize the app
const app = new Hono()

// Configure CORS for localhost development
app.use(
  '*',
  cors({
    origin: process.env.NODE_ENV === 'production' ? ['*'] : 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

// Initialize Cerebras with API key from environment variables
const cerebras = createCerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
})

// Welcome message
const welcomeStrings = [
  "Hello Hono!",
  "To learn more about Hono on Vercel, visit https://vercel.com/docs/frameworks/hono",
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
    // Use Cerebras to generate random information
    const result = await streamText({
      model: cerebras('qwen-3-32b'),
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

// Quiz data endpoint using generateObject
app.get('/quiz', async (c) => {
  try {
    // Importing zod for schema definition
    const { z } = await import('zod')
    
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

    // Generate quiz data using the AI model
    const { object } = await (await import('ai')).generateObject({
      model: cerebras('qwen-3-32b'),
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

export default app