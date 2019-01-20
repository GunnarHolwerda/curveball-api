import { Subject, ISubject } from '../entities/subject';
import { SubjectFactory } from '../factories/subject-factory';
import { SubjectType } from '../../types/subject-type';
import { SportTeam } from './sport-team';
import { FantasySubject } from '../../interfaces/fantasy-subject';

export interface ISportPlayer<T> extends ISubject {
    external_id: string;
    topic: number;
    parent_external_id: string;
    created: Date;
    updated: Date;
    deleted: boolean;
    json: T;
}

export abstract class SportPlayer<T> extends Subject<ISportPlayer<T>> implements FantasySubject {
    constructor(properties: ISportPlayer<T>) {
        super(properties);
    }

    async getRelatedSubjects(): Promise<Array<Subject<ISubject>>> {
        return [];
    }

    async getTeam(): Promise<SportTeam<any>> {
        return SubjectFactory.loadByExternalId(this.properties.external_id, SubjectType.sportTeam) as Promise<SportTeam<any>>;
    }

    abstract calculateFantasyScore(statistics: any): number;
}