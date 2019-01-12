import { Subject, ISubject } from '../entities/subject';

export interface INFLGame extends ISubject {
    id: number;
    topic: number;
    season: string;
    created: Date;
    updated: Date;
    deleted: boolean;
    json: any;
}

export class NFLGame extends Subject<INFLGame> {

    constructor(properties: INFLGame) {
        super(properties);
    }

    get title(): string {
        return 'test';
    }

    get subjectId(): number {
        return this.properties.subject_id;
    }

    get type(): string {
        return this.properties.subject_type;
    }
}