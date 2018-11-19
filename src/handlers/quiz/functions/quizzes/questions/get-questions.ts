import * as hapi from 'hapi';
import { QuizFactory } from '../../../models/factories/quiz-factory';

export async function getQuestions(event: hapi.Request): Promise<object> {
    const quizId: string = event.params['quizId'];
    const quiz = await QuizFactory.load(quizId);
    const questions = await quiz.getQuestions();

    const questionResponses = questions.map((q) => q.toResponseObject());

    return {
        questions: await Promise.all(questionResponses)
    };
}


