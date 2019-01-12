import { Subjectable } from '../../interfaces/subject';

export interface ISubject {
    subject_id: number;
    subject_type: string;
    topic: number;
}

export abstract class Subject<T extends ISubject> implements Subjectable {
    constructor(protected properties: T) { }

    abstract get title(): string;

    get subjectId(): number {
        return this.properties.subject_id;
    }

    get topicId(): number {
        return this.properties.topic;
    }

    get type(): string {
        return this.properties.subject_type;
    }
}