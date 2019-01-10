import * as Joi from 'joi';
import * as hapi from 'hapi';
import * as Boom from 'boom';
import { QuestionCalculator } from '../../../../models/entities/question-calculator';
import { snakifyKeys } from '../../../../util/snakify-keys';
import { QuestionTypeFactory } from '../../../../models/factories/question-type-factory';
import { TopicFactory } from '../../../../models/factories/topic-factory';

export const postQuestionCalculatorSchema = Joi.object().keys({
    topic: Joi.number().required().description('The topic id for which this calculator is valid'),
    functionName: Joi.string().required().description('The function name which will execute the calculating'),
    typeId: Joi.number().optional().description('The type id for the type of question this calculator works for')
});

export async function postQuestionCalculator(event: hapi.Request): Promise<object> {
    const { topic: topicId, functionName, typeId } = event.payload as { topic: number, functionName: string, typeId: number };

    const [type, topic] = await Promise.all([QuestionTypeFactory.load(typeId), TopicFactory.load(topicId)]);

    if (type === null || topic === null) {
        throw Boom.badRequest('Type or topic do not exist');
    }

    const calculator = await QuestionCalculator.create(snakifyKeys({ topic: topicId, functionName, typeId }));

    return { calculator: await calculator.toResponseObject() };
}


