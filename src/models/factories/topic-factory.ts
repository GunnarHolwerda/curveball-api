
import { Database } from '../database';
import { camelizeKeys } from '../../util/camelize-keys';
import * as _ from 'lodash';

export const TOPIC_TABLE_NAME = 'topic';

export interface ITopicResponse {
    topicId: number;
    label: string;
    machineName: string;
}

export class TopicFactory {
    private static topicCache: { [topicId: string]: ITopicResponse } = {};

    public static async load(topicId: number): Promise<ITopicResponse | null> {
        if (topicId in this.topicCache) {
            return this.topicCache[topicId];
        }
        const sq = Database.instance.sq;
        const result = await sq.from(TOPIC_TABLE_NAME).where`topic_id = ${topicId}`;

        if (result.length === 0) {
            return null;
        }
        this.topicCache[topicId] = camelizeKeys(result[0]) as ITopicResponse;
        return this.topicCache[topicId];
    }

    public static async loadAll(): Promise<Array<ITopicResponse>> {
        const sq = Database.instance.sq;
        const result = await sq.from(TOPIC_TABLE_NAME);
        result.forEach(r => {
            const topic = camelizeKeys(r) as ITopicResponse;
            this.topicCache[topic.topicId] = topic;
        });
        return _.values(this.topicCache);
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