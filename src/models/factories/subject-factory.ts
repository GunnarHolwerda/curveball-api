import { SubjectType } from '../../types/subject-type';
import { Database } from '../database';
import {
    ISubject,
    SPORT_GAME_TABLE_NAME,
    SPORT_PLAYER_TABLE_NAME,
    SPORT_SEASON_TABLE_NAME,
    SPORT_TEAM_TABLE_NAME,
    Subject,
    SUBJECT_TABLE_NAME
} from '../entities/subject';
import { INFLGame, NFLGame } from '../subjects/nfl-game';
import { TopicFactory } from './topic-factory';
import { cleanObject } from '../../util/clean-object';
import { NFLPlayer, INFLPlayer } from '../subjects/nfl-player';
import { NFLTeam, INFLTeam } from '../subjects/nfl-team';
import { SQF } from 'sqorn-pg/types/sq';

const SubjectTypeTableMap: { [type in SubjectType]: string } = {
    [SubjectType.sportGame]: SPORT_GAME_TABLE_NAME,
    [SubjectType.sportSeason]: SPORT_SEASON_TABLE_NAME,
    [SubjectType.sportPlayer]: SPORT_PLAYER_TABLE_NAME,
    [SubjectType.sportTeam]: SPORT_TEAM_TABLE_NAME,
};

export class SubjectFactory {

    public static async loadById(subjectId: number): Promise<Subject<ISubject> | null> {
        const sq = Database.instance.sq;
        const subjects = await sq.from(SUBJECT_TABLE_NAME).where`subject_id = ${subjectId}`;
        if (subjects.length === 0) {
            return null;
        }
        const subject = subjects.pop()!;
        const subjectType = (subject as ISubject).subject_type;
        const result = await this.joinSubjectTable(sq.from({ s: SUBJECT_TABLE_NAME }), subjectType)
            .where`s.subject_id = ${subjectId}`.and`s.subject_type = ${subjectType}`;

        if (result.length === 0) {
            return null;
        }

        return await this.instantiateInstance(cleanObject<ISubject>(result[0]));
    }

    public static async load(subjectId: number, subjectType: SubjectType): Promise<Subject<ISubject> | null> {
        const sq = Database.instance.sq;
        const result = await this.joinSubjectTable(sq.from({ s: SUBJECT_TABLE_NAME }), subjectType)
            .where`s.subject_id = ${subjectId}`.and`s.subject_type = ${subjectType}`;

        if (result.length === 0) {
            return null;
        }

        return await this.instantiateInstance(cleanObject<ISubject>(result[0]));
    }

    public static async loadByExternalId(externalId: string, subjectType: SubjectType): Promise<Subject<ISubject> | null> {
        const sq = Database.instance.sq;
        const result = await this.joinSubjectTable(sq.from({ s: SUBJECT_TABLE_NAME }), subjectType)
            .where`t.id = ${externalId}`;

        if (result.length === 0) {
            return null;
        }

        return await this.instantiateInstance(cleanObject<ISubject>(result[0]));
    }

    public static async loadAllByTypeAndTopic(subjectType: SubjectType, topicId: number): Promise<Array<Subject<ISubject>>> {
        const sq = Database.instance.sq;
        const result = await this.joinSubjectTable(sq.from({ s: SUBJECT_TABLE_NAME }), subjectType)
            .where`s.subject_type = ${subjectType}`.and`s.topic = ${topicId}`;

        // TODO: Improve performance by caching topics in redis
        return await Promise.all(result.map(r => this.instantiateInstance(cleanObject<ISubject>(r))));
    }

    private static joinSubjectTable(query: SQF, type: SubjectType): SQF {
        return query.join({ t: SubjectTypeTableMap[type] }).on`t.subject_id = s.subject_id`;
    }

    private static async instantiateInstance(sub: ISubject): Promise<Subject<ISubject>> {
        const topic = (await TopicFactory.load(sub.topic))!;
        switch (topic.machineName) {
            case 'nfl':
                return this.nflFactory(sub);
            default:
                throw new Error('subject is not associated with a known topic');
        }
    }

    private static nflFactory(sub: ISubject): Subject<ISubject> {
        switch (sub.subject_type) {
            case SubjectType.sportGame:
                return new NFLGame(sub as INFLGame);
            case SubjectType.sportPlayer:
                return new NFLPlayer(sub as INFLPlayer);
            case SubjectType.sportTeam:
                return new NFLTeam(sub as INFLTeam);
            default:
                throw new Error('Unsupported NFL subject type ' + sub.subject_type);
        }
    }
}