import { Subject, ISubject } from '../entities/subject';

export interface ISportPlayer<T> extends ISubject {
    external_id: string;
    topic: number;
    parent_external_id: string;
    created: Date;
    updated: Date;
    deleted: boolean;
    json: T;
}

export class SportPlayer<T> extends Subject<ISportPlayer<T>> {
    constructor(properties: ISportPlayer<T>) {
        super(properties);
    }

    async getRelatedSubjects(): Promise<Array<Subject<ISubject>>> {
        return [];
    }
}