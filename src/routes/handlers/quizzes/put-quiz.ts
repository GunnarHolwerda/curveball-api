import * as Joi from '@hapi/joi';
import * as Boom from '@hapi/boom';
import * as hapi from '@hapi/hapi';
import { IQuiz } from '../../../models/entities/quiz';
import { QuizFactory } from '../../../models/factories/quiz-factory';
import { snakifyKeys } from '../../../util/snakify-keys';

export const putQuizSchema = Joi.object().keys({
    active: Joi.boolean().optional().description('If the quiz is currently in progress'),
    title: Joi.string().optional().description('The title of the quiz'),
    completedDate: Joi.string().isoDate().optional().description('ISO timestamp of date the quiz was completed'),
    potAmount: Joi.number().optional().description('The amount of money to be won for the quiz'),
    auth: Joi.boolean().optional().description('If the quiz enforces correct answers.')
}).or('active', 'title', 'completedDate', 'potAmount', 'auth');

export async function putQuiz(event: hapi.Request): Promise<object> {
    const quizId: string = event.params['quizId'];
    const quizParams = snakifyKeys(event.payload as object) as IQuiz;
    const quiz = await QuizFactory.load(quizId);

    if (quiz === null) {
        throw Boom.notFound();
    }

    for (const property in quizParams) {
        if (quiz.properties.hasOwnProperty(property)) {
            const value = quizParams[property];
            if (property === 'completedDate' && value) {
                quiz.properties.completed_date = new Date(Date.parse(value));
            } else if (property === 'completedDate' && !value) {
                quiz.properties.completed_date = null;
            } else {
                quiz.properties[property] = quizParams[property];
            }
        }
    }

    await quiz.save();

    return { quiz: await quiz.toResponseObject() };
}


