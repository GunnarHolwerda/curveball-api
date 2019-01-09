import * as hapi from 'hapi';
import { Database } from '../../../../models/database';
import { camelizeKeys } from '../../../../util/camelize-keys';

export const TOPIC_TABLE_NAME = 'topic';

// interface ITopic {
//     topic_id: number;
//     label: string;
//     machine_name: string;
// }

interface ITopicResponse {
    topicId: number;
    label: string;
    machineName: string;
}

export async function getQuestionTopics(_: hapi.Request): Promise<object> {
    const sq = Database.instance.sq;
    const result = await sq.from(TOPIC_TABLE_NAME);

    const topics: Array<ITopicResponse> = result.map(r => camelizeKeys(r));

    return { topics };
}


