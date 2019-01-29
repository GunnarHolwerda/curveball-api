import { ITopicResponse } from '../models/factories/topic-factory';

export interface SubjectTableResponse {
    subjectId: number;
    topic: ITopicResponse;
    created: string;
    updated: string;
}