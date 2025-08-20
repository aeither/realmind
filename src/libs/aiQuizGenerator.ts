// AI Quiz Generator - Backend API integration

interface AIQuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface AIQuizConfig {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  topic: string;
  questionCount: number;
  questions: AIQuizQuestion[];
  createdAt: string;
  source: string;
}

interface GenerateQuizParams {
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionCount: number;
  userInterests?: string[];
}

export class AIQuizGenerator {
  private backendUrl: string;

  constructor() {
    // Use backend URL from environment variable or fallback to localhost
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    console.log('🔗 AI Quiz Generator using backend:', this.backendUrl);
  }

  async generateQuiz(params: GenerateQuizParams): Promise<AIQuizConfig> {
    try {
      console.log('🤖 Requesting AI quiz generation from backend...');
      
      const response = await fetch(`${this.backendUrl}/generate-ai-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      console.log('✅ AI quiz generated successfully');
      return data.quiz;
    } catch (error) {
      console.error('❌ Failed to generate AI quiz:', error);
      throw error;
    }
  }

  // Generate quiz URL with base64 encoded data
  generateQuizUrl(quizConfig: AIQuizConfig): string {
    const encodedQuiz = btoa(JSON.stringify(quizConfig));
    return `/quiz-game?quiz=ai-custom&data=${encodedQuiz}`;
  }

  // Decode quiz data from URL
  static decodeQuizFromUrl(encodedData: string): AIQuizConfig {
    try {
      const decodedData = atob(encodedData);
      return JSON.parse(decodedData);
    } catch (error) {
      console.error('Failed to decode quiz data:', error);
      throw new Error('Invalid quiz data format');
    }
  }
}

// Export a singleton instance
export const aiQuizGenerator = new AIQuizGenerator();

