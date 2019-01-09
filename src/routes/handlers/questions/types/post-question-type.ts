import * as Joi from 'joi';
import * as hapi from 'hapi';
import { QuestionType } from '../../../../models/entities/question-type';

export const postQuestionTypeSchema = Joi.object().keys({
    title: Joi.string().required().description('The title to be displayed for the question type'),
    description: Joi.string().required().description('More detail about the question type')
});

export async function postQuestionType(event: hapi.Request): Promise<object> {
    const { title, description } = event.payload as { title: string, description: string };

    const type = await QuestionType.create({ title, description });

    return { type: await type.toResponseObject() };
}


