import { Subject, ISubject } from '../entities/subject';
import { SubjectFactory } from '../factories/subject-factory';
import { SubjectType } from '../../types/subject-type';
import { SportTeam } from './sport-team';
import { FantasySubject } from '../../interfaces/fantasy-subject';
import { SubjectTableResponse } from '../../interfaces/subject-table-response';
import { camelizeKeys } from '../../util/camelize-keys';

export interface ISportPlayer<T> extends ISubject {
    external_id: string;
    topic: number;
    parent_external_id: string;
    created: Date;
    updated: Date;
    deleted: boolean;
    json: T;
}

export interface ISportPlayerResponse extends SubjectTableResponse {
    name: string;
    position: string;
}

export interface SportPlayerResponse {
    fullName: string;
    position: string;
}

export abstract class SportPlayer<T> extends Subject<ISportPlayer<T>> implements FantasySubject {
    constructor(properties: ISportPlayer<T>) {
        super(properties);
    }

    async getRelatedSubjects(): Promise<Array<Subject<ISubject>>> {
        return [];
    }

    async getTeam(): Promise<SportTeam<any>> {
        return SubjectFactory.loadByExternalId(this.properties.parent_external_id, SubjectType.sportTeam) as Promise<SportTeam<any>>;
    }

    async toResponseObject(): Promise<ISportPlayerResponse> {
        const { external_id, parent_external_id, created, updated } = this.properties;
        const team = await this.getTeam();
        const [baseResponse, teamResponse, player] = await Promise.all(
            [super.toResponseObject(), team.toResponseObject(), this.playerResponse()]
        );
        return camelizeKeys({
            ... (baseResponse),
            external_id, created, updated,
            teamExternalId: parent_external_id,
            team: teamResponse,
            player
        });
    }

    abstract playerResponse(): Promise<SportPlayerResponse>;
    abstract calculateFantasyScore(statistics: any): number;
}