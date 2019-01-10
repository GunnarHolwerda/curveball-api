import * as hapi from 'hapi';
import { TopicFactory } from '../../../../models/factories/topic-factory';


export async function getQuestionTopics(_: hapi.Request): Promise<object> {
    const topics = await TopicFactory.loadAll();

    return { topics };
}


