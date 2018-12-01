import { QuizNamespace } from '../models/namespaces/quiz-namespace';

export interface QuizNamespaceCache {
    [quizId: string]: QuizNamespace;
}