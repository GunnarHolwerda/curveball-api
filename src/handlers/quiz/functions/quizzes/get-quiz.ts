import { QuizFactory } from '../../models/factories/quiz-factory';
import * as hapi from 'hapi';

export async function getQuiz(event: hapi.Request): Promise<object> {
    const quizId: string = event.params['quizId'];
    const quiz = await QuizFactory.load(quizId);

    return {
        quiz: await quiz.toResponseObject(true)
    };
}
