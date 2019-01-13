import { ITopicResponse } from '../models/factories/topic-factory';

export interface SubjectTableResponse {
    id: number;
    topic: ITopicResponse;
    created: string;
    updated: string;
}