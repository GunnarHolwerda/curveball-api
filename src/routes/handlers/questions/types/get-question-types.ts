import * as hapi from '@hapi/hapi';
import * as Joi from '@hapi/joi';
import * as Boom from '@hapi/boom';
import { QuestionTypeFactory } from '../../../../models/factories/question-type-factory';
import { TopicFactory } from '../../../../models/factories/topic-factory';
import { QuestionType } from '../../../../models/entities/question-type';

export const getQuestionTypesQueryParams = {
    forTopic: Joi.number().optional().description('Only get question types available for this topic id')
};

export async function getQuestionTypes(request: hapi.Request): Promise<object> {
    const { forTopic } = request.query as { forTopic?: number };

    let types: Array<QuestionType> = [];
    if (forTopic !== undefined) {
        const topic = await TopicFactory.load(forTopic);
        if (topic === null) {
            throw Boom.badRequest('Topic does not exist');
        }
        types = await QuestionTypeFactory.loadAllAvailableForTopic(topic.topicId);

    } else {
        types = await QuestionTypeFactory.loadAll();
    }

    const responseObjects = await Promise.all(types.map(t => t.toResponseObject()));

    return { types: responseObjects };
}


