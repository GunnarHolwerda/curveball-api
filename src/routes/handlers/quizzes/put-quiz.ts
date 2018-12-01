import * as Joi from 'joi';
import * as Boom from 'boom';
import * as hapi from 'hapi';
import { IQuiz } from '../../../models/entities/quiz';
import { QuizFactory } from '../../../models/factories/quiz-factory';

export const putQuizSchema = Joi.object().keys({
    active: Joi.boolean().optional(),
    title: Joi.string().optional(),
    completed: Joi.boolean().optional(),
    potAmount: Joi.number().optional(),
    auth: Joi.boolean().optional()
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


