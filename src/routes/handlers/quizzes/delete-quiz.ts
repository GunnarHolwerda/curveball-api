import * as hapi from '@hapi/hapi';
import * as Boom from '@hapi/boom';
import { QuizFactory } from '../../../models/factories/quiz-factory';

export async function deleteQuiz(event: hapi.Request): Promise<object> {
    const quizId: string = event.params['quizId'];
    const quiz = await QuizFactory.load(quizId);
    if (quiz === null) {
        throw Boom.notFound();
    }

    await quiz.delete();

    return {
        success: 'ok'
    };
}
