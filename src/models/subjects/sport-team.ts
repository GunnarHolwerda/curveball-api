import { Subject, ISubject } from '../entities/subject';
import { SubjectTableResponse } from '../../interfaces/subject-table-response';
import { TopicFactory } from '../factories/topic-factory';
import { camelizeKeys } from '../../util/camelize-keys';
import { SubjectFactory } from '../factories/subject-factory';
import { SubjectType } from '../../types/subject-type';
import { SportGame } from './sport-game';

export interface ISportTeam<T> extends ISubject {
    external_id: string;
    topic: number;
    season: string;
    created: Date;
    updated: Date;
    deleted: boolean;
    json: T & { name: string, alias: string };
}

export interface ISportTeamResponse extends SubjectTableResponse {
    season: string;
    team: {
        name: string;
        abbreviation: string;
    };
}

export abstract class SportTeam<T> extends Subject<ISportTeam<T>> {

    constructor(properties: ISportTeam<T>) {
        super(properties);
    }

    async toResponseObject(): Promise<ISportTeamResponse> {
        const { external_id, topic: topicId, season, created, updated } = this.properties;
        const topic = await TopicFactory.load(topicId);
        const { name, alias } = this.properties.json;
        return camelizeKeys({
            ... (await super.toResponseObject()),
            external_id, topic, season, created, updated,
            team: {
                name,
                abbreviation: alias
            }
        });
    }

    async getRelatedSubjects(): Promise<Subject<ISubject>[]> {
        return SubjectFactory.loadAllExternallyRelatedSubjects(
            this.properties.external_id, SubjectType.sportPlayer
        );
    }

    gameOnDay(date: Date): Promise<SportGame<any, any>> {
        return SubjectFactory.loadSportGameForTeamOnDay(this.properties.external_id, date) as Promise<SportGame<any, any>>;
    }
}