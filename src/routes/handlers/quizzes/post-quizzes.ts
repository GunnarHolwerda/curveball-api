import * as Joi from '@hapi/joi';

import * as hapi from '@hapi/hapi';
import { IQuizResponse, IQuiz, Quiz } from '../../../models/entities/quiz';
import { QuizFactory } from '../../../models/factories/quiz-factory';
import { AccountJwtClaims } from '../../../interfaces/account-jwt-claims';

export const postQuizzesSchema = Joi.object().keys({
    title: Joi.string().required().description('The title of the quiz'),
    potAmount: Joi.number().required().description('The amount of money to be won for the quiz'),
    auth: Joi.boolean().default(true).description('Whether the quiz enforces correct answers or not')
});

export interface PostQuizPayload {
    title: string;
    potAmount: number;
    auth?: boolean;
}

export async function postQuizzes(event: hapi.Request): Promise<object> {
    const quizParams = event.payload as IQuizResponse;
    const { networkId } = event.auth.credentials as AccountJwtClaims;
    const newQuiz: Partial<IQuiz> = {
        network_id: networkId,
        title: quizParams.title,
        auth: quizParams.auth,
        pot_amount: quizParams.potAmount
    };
    const quizId = await Quiz.create(newQuiz);
    const quiz = (await QuizFactory.load(quizId))!;

    return { quiz: await quiz.toResponseObject() };
}


