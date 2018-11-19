import * as Joi from 'joi';

import * as hapi from 'hapi';
import { IQuiz, Quiz } from '../../models/quiz';

export const postQuizzesSchema = Joi.object().keys({
    title: Joi.string().required(),
    potAmount: Joi.number().required(),
    auth: Joi.boolean().default(true)
});

export interface PostQuizPayload {
    title: string;
    potAmount: number;
    auth?: boolean;
}

export async function postQuizzes(event: hapi.Request): Promise<object> {
    const quizParams = event.payload as IQuiz;
    const quiz = await Quiz.create(quizParams);

    return { quiz: await quiz.toResponseObject() };
}


