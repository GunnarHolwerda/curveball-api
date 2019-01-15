import { camelizeKeys } from '../../util/camelize-keys';
import { SubjectType } from '../../types/subject-type';
import { Choice } from './question-choice';
import { ChoiceFactory } from '../factories/choice-factory';
import { SubjectTypeTableMap } from '../factories/subject-factory';
import { Database } from '../database';
import { omit } from '../../util/omit';

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

    public async getRelatedChoices(): Promise<Array<Choice>> {
        return ChoiceFactory.loadAllBySubjectId(this.properties.subject_id);
    }

    public get tableName(): string {
        return SubjectTypeTableMap[this.properties.subject_type];
    }

    public async save(): Promise<void> {
        const sq = Database.instance.sq;
        await sq.from(this.tableName)
            .set({ ...omit(this.properties, ['subject_id', 'subject_type', 'topic']) })
            .where`subject_id = ${this.properties.subject_id}`;
        this.properties = { ...this.properties };
    }

    abstract getRelatedSubjects(): Promise<Array<Subject<ISubject>>>;
}