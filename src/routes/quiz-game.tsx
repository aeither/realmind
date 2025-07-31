import { createFileRoute } from '@tanstack/react-router'
import QuizGameContract from '../components/QuizGameContract'

export const Route = createFileRoute('/quiz-game')({
  component: () => <QuizGameContract />,
})