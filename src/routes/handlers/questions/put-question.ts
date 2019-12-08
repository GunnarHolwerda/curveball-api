import * as Joi from '@hapi/joi';
import * as Boom from '@hapi/boom';
import * as hapi from '@hapi/hapi';
import { IQuestion } from '../../../models/entities/question';
import { QuestionFactory } from '../../../models/factories/question-factory';

export const putQuestionSchema = Joi.object().keys({
    question: Joi.string().optional().description('The text for the question'),
    questionNum: Joi.number().optional().description('Which question number this is'),
    ticker: Joi.string().optional().description('An abbreviated text for the question'),
    topic: Joi.number().optional().description('The id of the topic the question relates to'),
    typeId: Joi.number().optional().description('The id of the question type'),
    sent: Joi.boolean().optional().description('Update if the question has been sent to the client or not'),
    expired: Joi.date().optional().description('Update the expiration date of the question'),
    quizId: Joi.string().optional().description('Update the quiz for which this question belongs to'),
}).or('question', 'questionNum', 'sent', 'expired', 'quizId', 'ticker', 'sport');

export async function putQuestions(event: hapi.Request): Promise<object> {
    const questionId: string = event.params['questionId'];
    const questionParams = event.payload as IQuestion;
    const question = await QuestionFactory.load(questionId);
    if (!question) {
        throw Boom.notFound();
    }

    for (const property in questionParams) {
        if (questionParams.hasOwnProperty(property)) {
            question.properties[property] = questionParams[property];
        }
    }

    await question.save();

    return { question: await question.toResponseObject() };
}


