import { camelizeKeys } from '../../util/camelize-keys';
import { SubjectType } from '../../types/subject-type';
import { SubjectTypeTableMap } from '../factories/subject-factory';
import { Database } from '../database';
import { omit } from '../../util/omit';
import { TopicFactory } from '../factories/topic-factory';
import { SimpleSubjectResponse } from '../../interfaces/simple-subject-response';

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
    constructor(public properties: T) { }

    async toResponseObject(): Promise<any> {
        const { subject_id, subject_type, topic } = this.properties;
        return camelizeKeys({ subject_id, subject_type, topic: await TopicFactory.load(topic) });
    }

    public get tableName(): string {
        return SubjectTypeTableMap[this.properties.subject_type];
    }

    public async save(): Promise<void> {
        const sq = Database.instance.sq;
        await sq.from(this.tableName)
            .set({ ...omit(this.properties, ['subject_id', 'subject_type', 'topic']) })
            .where`subject_id = ${this.properties.subject_id}`;
        this.properties = { ...(this.properties as object) } as T;
    }

    abstract getRelatedSubjects(): Promise<Array<Subject<ISubject>>>;
    async asQuestionResponse(): Promise<SimpleSubjectResponse> {
        return {
            subjectId: this.properties.subject_id,
            headline: 'none',
            description: 'none',
            status: 'finished'
        };
    }
}