
import { Database } from '../database';
import { camelizeKeys } from '../../util/camelize-keys';

export const TOPIC_TABLE_NAME = 'topic';

// interface ITopic {
//     topic_id: number;
//     label: string;
//     machine_name: string;
// }

export interface ITopicResponse {
    topicId: number;
    label: string;
    machineName: string;
}


export class TopicFactory {
    public static async load(topicId: number): Promise<ITopicResponse | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(TOPIC_TABLE_NAME).where`topic_id = ${topicId}`;

        if (result.length === 0) {
            return null;
        }
        return camelizeKeys(result[0]) as ITopicResponse;
    }

    public static async loadAll(): Promise<Array<ITopicResponse>> {
        const sq = Database.instance.sq;
        const result = await sq.from(TOPIC_TABLE_NAME);
        return result.map(r => camelizeKeys(r) as ITopicResponse);
    }

    public static async loadByName(name: string): Promise<ITopicResponse | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(TOPIC_TABLE_NAME).where`machine_name = ${name}`;

        if (result.length === 0) {
            return null;
        }
        return camelizeKeys(result[0]) as ITopicResponse;
    }
}