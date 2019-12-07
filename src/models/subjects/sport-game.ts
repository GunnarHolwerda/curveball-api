import { BasicSportGame } from '../../interfaces/basic-sport-game';
import { SubjectTableResponse } from '../../interfaces/subject-table-response';
import { SubjectType } from '../../types/subject-type';
import { camelizeKeys } from '../../util/camelize-keys';
import { ISubject, Subject } from '../entities/subject';
import { SubjectFactory } from '../factories/subject-factory';
import { ISportTeamResponse, SportTeam } from './sport-team';
import { SportPlayer } from './sport-player';
import { SportsApi } from '../data-loader/sports-api';

export interface ISportGame<TJson, TStats> extends ISubject {
    external_id: string;
    topic: number;
    parent_external_id: string;
    created: Date;
    updated: Date;
    deleted: boolean;
    json: { home: any, away: any, scheduled: string, status: string } & TJson;
    statistics: { home: any, away: any, scheduled: string, status: string } & TStats;
}

export interface SportGameResponse {
    home: ISportTeamResponse;
    away: ISportTeamResponse;
    date: string;
}

export interface ISportGameResponse extends SubjectTableResponse {
    game: SportGameResponse;
}

export abstract class SportGame<TJson, TStats> extends Subject<ISportGame<TJson, TStats>> implements BasicSportGame {
    constructor(properties: ISportGame<TJson, TStats>) {
        super(properties);
    }

    get homeTeam(): Promise<SportTeam<any>> {
        const { home } = this.properties.json;
        return SubjectFactory.loadByExternalId(home.id, SubjectType.sportTeam)
            .then(t => t! as SportTeam<any>);
    }

    get awayTeam(): Promise<SportTeam<any>> {
        const { away } = this.properties.json;
        return SubjectFactory.loadByExternalId(away.id, SubjectType.sportTeam)
            .then(t => t! as SportTeam<any>);
    }

    get players(): Promise<Array<SportPlayer<any>>> {
        return (async () => {
            const teams = await Promise.all([this.homeTeam, this.awayTeam]);
            const [homeTeamPlayers, awayTeamPlayers] = await Promise.all(
                teams.map(t => t.getRelatedSubjects().then(s => s as Array<SportPlayer<any>>))
            );
            return [...homeTeamPlayers, ...awayTeamPlayers];
        })();
    }

    async toResponseObject(): Promise<ISportGameResponse> {
        const { external_id, topic, parent_external_id, created, updated } = this.properties;
        const [homeTeam, awayTeam] = await Promise.all([this.homeTeam, this.awayTeam]);
        return camelizeKeys({
            ... (await super.toResponseObject()),
            external_id, topic, created, updated,
            seasonExternalId: parent_external_id,
            game: {
                home: await homeTeam!.toResponseObject(),
                away: await awayTeam!.toResponseObject(),
                date: this.properties.json.scheduled,
                status: this.properties.json.status
            }
        });
    }

    async getRelatedSubjects(): Promise<Array<Subject<ISubject>>> {
        const [home, away, players] = await Promise.all([this.homeTeam, this.awayTeam, this.players]);
        return [home, away, ...players];
    }

    isFinished(): boolean {
        const { status: gameStatus } = this.properties.json;
        const boxScoreStatus = this.properties.statistics ? this.properties.statistics.status : undefined;
        return (gameStatus === 'closed') || (boxScoreStatus === 'closed');
    }

    getHomeTeam(): { id: string; points: number; } {
        return this.properties.statistics.home;
    }

    getAwayTeam(): { id: string; points: number; } {
        return this.properties.statistics.away;
    }

    async updateStatistics(): Promise<void> {
        const sportsApi = this.getSportsApi();
        const boxscore = await sportsApi.getGameStats(this.properties.external_id);
        this.properties.statistics = boxscore as TStats & { home: any, away: any, scheduled: string, status: string };
        await this.save();
    }

    abstract getSportsApi(): SportsApi;
    abstract getStatsForPlayer(player: SportPlayer<any>): any;
    abstract getStatsForTeam(team: SportTeam<any>): any;
}