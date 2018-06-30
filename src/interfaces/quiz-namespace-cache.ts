import { QuizNamespace } from '../models/quiz-namespace';

export interface QuizNamespaceCache {
    [quizId: string]: QuizNamespace;
}