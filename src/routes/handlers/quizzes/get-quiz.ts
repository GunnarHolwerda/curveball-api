import * as hapi from 'hapi';
import * as Boom from 'boom';
import { QuizFactory } from '../../../models/factories/quiz-factory';

export async function getQuiz(event: hapi.Request): Promise<object> {
    const quizId: string = event.params['quizId'];
    const quiz = await QuizFactory.load(quizId);
    if (quiz === null) {
        throw Boom.notFound();
    }

    return {
        quiz: await quiz.toResponseObject(true)
    };
}
