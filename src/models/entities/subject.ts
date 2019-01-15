import { camelizeKeys } from '../../util/camelize-keys';
import { SubjectType } from '../../types/subject-type';
import { Choice } from './question-choice';

export interface ISubject {
    subject_id: number;
    subject_type: SubjectType;
    topic: number;
}

export const SUBJECT_TABLE_NAME = 'subject';
export const SPORT_GAME_TABLE_NAME = 'sport_game';
export const SPORT_SEASON_TABLE_NAME = 'sport_season';
export const SPORT_PLAYER_TABLE_NAME = 'sport_player';
export const SPORT_TEAM_TABLE_NAME = 'sport_team';

export abstract class Subject<T extends ISubject> {
    constructor(protected properties: T) { }

    async toResponseObject(): Promise<any> {
        const { subject_id, subject_type, topic } = this.properties;
        return camelizeKeys({ subject_id, subject_type, topic });
    }

    abstract getRelatedChoices(): Promise<Array<Choice>>;
    abstract getRelatedSubjects(): Promise<Array<Subject<ISubject>>>;
}