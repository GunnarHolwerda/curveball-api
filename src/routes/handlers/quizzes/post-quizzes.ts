import * as Joi from 'joi';

import * as hapi from 'hapi';
import { IQuizResponse, IQuiz, Quiz } from '../../../models/entities/quiz';

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
    const quizParams = event.payload as IQuizResponse;
    const newQuiz: Partial<IQuiz> = {
        title: quizParams.title,
        auth: quizParams.auth,
        pot_amount: quizParams.potAmount
    };
    const quiz = await Quiz.create(newQuiz);

    return { quiz: await quiz.toResponseObject() };
}


