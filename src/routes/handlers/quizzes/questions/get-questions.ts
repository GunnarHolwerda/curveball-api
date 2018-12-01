import * as hapi from 'hapi';
import * as Boom from 'boom';
import { QuizFactory } from '../../../../models/factories/quiz-factory';

export async function getQuestions(event: hapi.Request): Promise<object> {
    const quizId: string = event.params['quizId'];
    const quiz = await QuizFactory.load(quizId);
    if (quiz === null) {
        throw Boom.notFound();
    }
    const questions = await quiz.getQuestions();

    const questionResponses = questions.map((q) => q.toResponseObject());

    return {
        questions: await Promise.all(questionResponses)
    };
}


