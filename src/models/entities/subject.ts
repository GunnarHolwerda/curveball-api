import { Subjectable } from '../../interfaces/subject';
import { camelizeKeys } from '../../util/camelize-keys';

export interface ISubject {
    subject_id: number;
    subject_type: string;
    topic: number;
}

export const SUBJECT_TABLE_NAME = 'subject';
export const SPORT_GAME_TABLE_NAME = 'sport_game';
export const SPORT_SEASON_TABLE_NAME = 'sport_season';
export const SPORT_PLAYER_TABLE_NAME = 'sport_player';
export const SPORT_TEAM_TABLE_NAME = 'sport_team';

export abstract class Subject<T extends ISubject> implements Subjectable {
    constructor(protected properties: T) { }

    get subjectId(): number {
        return this.properties.subject_id;
    }

    get topicId(): number {
        return this.properties.topic;
    }

    get type(): string {
        return this.properties.subject_type;
    }

    async toResponseObject(): Promise<any> {
        return camelizeKeys({ ...this.properties });
    }
}