import * as Joi from 'joi';

import * as hapi from 'hapi';
import { IQuestion } from '../../models/question';
import { QuestionFactory } from '../../models/factories/question-factory';
import { CurveballNotFound } from '../../models/curveball-error';

export const putQuestionSchema = Joi.object().keys({
    question: Joi.string().optional(),
    questionNum: Joi.number().optional(),
    ticker: Joi.string().optional(),
    sport: Joi.string().optional(),
    sent: Joi.boolean().optional(),
    expired: Joi.date().optional(),
    quizId: Joi.string().optional(),
}).or('question', 'questionNum', 'sent', 'expired', 'quizId', 'ticker', 'sport');

export async function putQuestions(event: hapi.Request): Promise<object> {
    const questionId: string = event.params['questionId'];
    const questionParams = event.payload as IQuestion;
    const question = await QuestionFactory.load(questionId);
    if (!question) {
        throw new CurveballNotFound();
    }

    for (const property in questionParams) {
        if (questionParams.hasOwnProperty(property)) {
            question.properties[property] = questionParams[property];
        }
    }

    await question.save();

    return { question: question.toResponseObject() };
}


