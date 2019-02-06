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
import { NFLGame } from '../subjects/nfl-game';
import { TopicFactory } from './topic-factory';
import { cleanObject } from '../../util/clean-object';
import { NFLPlayer } from '../subjects/nfl-player';
import { NFLTeam } from '../subjects/nfl-team';
import { SQF } from 'sqorn-pg/types/sq';
import { NBATeam } from '../subjects/nba-team';
import { NBAGame } from '../subjects/nba-game';
import { NBAPlayer } from '../subjects/nba-player';
import { ISportPlayer } from '../subjects/sport-player';
import { NBAResponse } from '../../interfaces/sports-api-responses/nba';
import { ISportTeam } from '../subjects/sport-team';
import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';
import { ISportGame } from '../subjects/sport-game';

export const SubjectTypeTableMap: { [type in SubjectType]: string } = {
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

    public static async loadAllExternallyRelatedSubjects(
        parentExternalId: string,
        subjectType: SubjectType
    ): Promise<Array<Subject<ISubject>>> {
        const sq = Database.instance.sq;
        const result = await this.joinSubjectTable(sq.from({ s: SUBJECT_TABLE_NAME }), subjectType)
            .where`t.parent_external_id = ${parentExternalId}`;

        return Promise.all(result.map(r => this.instantiateInstance(r as ISubject).then(s => s!)));
    }

    public static async loadByExternalId(externalId: string, subjectType: SubjectType): Promise<Subject<ISubject> | null> {
        const sq = Database.instance.sq;
        const result = await this.joinSubjectTable(sq.from({ s: SUBJECT_TABLE_NAME }), subjectType)
            .where`t.external_id = ${externalId}`;

        if (result.length === 0) {
            return null;
        }

        return await this.instantiateInstance(result[0] as ISubject);
    }

    public static async loadAllByTypeAndTopic(subjectType: SubjectType, topicId: number): Promise<Array<Subject<ISubject>>> {
        const sq = Database.instance.sq;
        const result = await this.joinSubjectTable(sq.from({ s: SUBJECT_TABLE_NAME }), subjectType)
            .where`s.subject_type = ${subjectType}`.and`s.topic = ${topicId}`;

        // TODO: Improve performance by caching topics in redis
        return await Promise.all(result.map(r => this.instantiateInstance(r as ISubject)));
    }

    public static async loadAllSportsGamesBetweenDate(startDate: Date, endDate: Date): Promise<Array<Subject<ISubject>>> {
        const startDateISO = startDate.toISOString();
        const endDateISO = endDate.toISOString();
        const sq = Database.instance.sq;
        const query = this.joinSubjectTable(sq.from({ s: SUBJECT_TABLE_NAME }), SubjectType.sportGame)
            .where(sq.raw(
                `(json->>'scheduled')::timestamp with time zone >= TO_TIMESTAMP('${startDateISO}', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`
            ))
            .and(
                sq.raw(`(json->>'scheduled')::timestamp with time zone < TO_TIMESTAMP('${endDateISO}', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`)
            ).and`s.subject_id = ${3400}`;
        const result = await query;

        return await Promise.all(result.map(r => this.instantiateInstance(r as ISubject)));
    }

    public static async loadSportGameForTeamOnDay(teamExternalId: string, date: Date): Promise<Subject<ISubject>> {
        const startDate = new Date(date.getTime());
        startDate.setTime(0);
        const endDate = new Date(startDate.getTime());
        endDate.setDate(startDate.getDate() + 1);
        const sq = Database.instance.sq;
        const query = sq.from({ s: SUBJECT_TABLE_NAME })
            .join({ game: SPORT_GAME_TABLE_NAME }).on`game.subject_id = s.subject_id`
            .where(sq.raw(`json -> 'home' ->> 'id' = ${teamExternalId}`))
            .or(sq.raw(`json -> 'away' ->> 'id' = ${teamExternalId}`))
            .and(sq.raw(
                `(json->>'scheduled')::timestamp with time zone >= TO_TIMESTAMP('${startDate.toISOString()}', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`
            ))
            .and(sq.raw(
                `(json->>'scheduled')::timestamp with time zone < TO_TIMESTAMP('${endDate.toISOString()}', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`
            ));
        const result = await query;
        return this.instantiateInstance(result[0] as ISubject);
    }

    private static joinSubjectTable(query: SQF, type: SubjectType): SQF {
        return query.join({ t: SubjectTypeTableMap[type] }).on`t.subject_id = s.subject_id`;
    }

    private static async instantiateInstance(sub: ISubject): Promise<Subject<ISubject>> {
        const topic = (await TopicFactory.load(sub.topic))!;
        switch (topic.machineName) {
            case 'nfl':
                return this.nflFactory(sub);
            case 'nba':
                return this.nbaFactory(sub);
            default:
                throw new Error(`subject is not associated with a known topic ${sub.toString()}`);
        }
    }

    private static nbaFactory(sub: ISubject): Subject<ISubject> {
        switch (sub.subject_type) {
            case SubjectType.sportGame:
                return new NBAGame(sub as ISportGame<NBAResponse.Game, NBAResponse.GameStatistics>);
            case SubjectType.sportPlayer:
                return new NBAPlayer(sub as ISportPlayer<NBAResponse.PlayerDetail>);
            case SubjectType.sportTeam:
                return new NBATeam(sub as ISportTeam<NBAResponse.Team>);
            default:
                throw new Error('Unsupported NBA subject type ' + sub.subject_type);
        }
    }

    private static nflFactory(sub: ISubject): Subject<ISubject> {
        switch (sub.subject_type) {
            case SubjectType.sportGame:
                return new NFLGame(sub as ISportGame<NFLResponse.Game, NFLResponse.GameStatistics>);
            case SubjectType.sportPlayer:
                return new NFLPlayer(sub as ISportPlayer<NFLResponse.Player>);
            case SubjectType.sportTeam:
                return new NFLTeam(sub as ISportTeam<NFLResponse.Team>);
            default:
                throw new Error('Unsupported NFL subject type ' + sub.subject_type);
        }
    }
}