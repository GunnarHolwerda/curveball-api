import * as Joi from 'joi';
import * as hapi from 'hapi';
import { QuestionType } from '../../../../models/entities/question-type';
import { QuestionTypeFactory } from '../../../../models/factories/question-type-factory';

export const postQuestionTypeSchema = Joi.object().keys({
    title: Joi.string().required().description('The title to be displayed for the question type'),
    description: Joi.string().required().description('More detail about the question type'),
    generic: Joi.boolean().optional().description('This question type would work for any topic')
});

export async function postQuestionType(event: hapi.Request): Promise<object> {
    const { title, description, generic } = event.payload as { title: string, description: string, generic: boolean };

    const typeId = await QuestionType.create({
        title, description, generic,
        machine_name: title.replace(' ', '-').toLowerCase()
    });
    const type = (await QuestionTypeFactory.load(typeId))!;

    return { type: await type.toResponseObject() };
}


