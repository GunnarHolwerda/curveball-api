import * as Joi from 'joi';
import * as Boom from 'boom';
import * as hapi from 'hapi';
import { IQuiz } from '../../../models/entities/quiz';
import { QuizFactory } from '../../../models/factories/quiz-factory';

export const putQuizSchema = Joi.object().keys({
    active: Joi.boolean().optional().description('If the quiz is currently in progress'),
    title: Joi.string().optional().description('The title of the quiz'),
    completed: Joi.boolean().optional().description('If the quiz is over'),
    potAmount: Joi.number().optional().description('The amount of money to be won for the quiz'),
    auth: Joi.boolean().optional().description('If the quiz enforces correct answers.')
}).or('active', 'title', 'completed', 'potAmount', 'auth');

export async function putQuiz(event: hapi.Request): Promise<object> {
    const quizId: string = event.params['quizId'];
    const quizParams = event.payload as IQuiz;
    const quiz = await QuizFactory.load(quizId);

    if (quiz === null) {
        throw Boom.notFound();
    }

    for (const property in quizParams) {
        if (quiz.properties.hasOwnProperty(property)) {
            quiz.properties[property] = quizParams[property];
        }
    }

    await quiz.save();

    return { quiz: await quiz.toResponseObject() };
}


