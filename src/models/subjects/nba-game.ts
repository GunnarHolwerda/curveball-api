import { SportGame } from '../../interfaces/sport-game';
import { NBAResponse } from '../../interfaces/sports-api-responses/nba';
import { SubjectTableResponse } from '../../interfaces/subject-table-response';
import { SubjectType } from '../../types/subject-type';
import { camelizeKeys } from '../../util/camelize-keys';
import { ISubject, Subject } from '../entities/subject';
import { SubjectFactory } from '../factories/subject-factory';
import { NBAPlayer } from './nba-player';
import { NBATeam } from './nba-team';
import { NFLTeamResponse } from './nfl-team';
import { NBASportsApi } from '../data-loader/nba-sports-api';

export interface INBAGame extends ISubject {
    external_id: string;
    topic: number;
    parent_external_id: string;
    created: Date;
    updated: Date;
    deleted: boolean;
    json: NBAResponse.Game;
    statistics: NBAResponse.GameStatistics;
}

export interface NBAGameResponse {
    home: NFLTeamResponse;
    away: NFLTeamResponse;
    date: string;
}

export interface INBAGameResponse extends SubjectTableResponse {
    game: NBAGameResponse;
}

export class NBAGame extends Subject<INBAGame> implements SportGame {
    constructor(properties: INBAGame) {
        super(properties);
    }

    get homeTeam(): Promise<NBATeam> {
        const { home } = this.properties.json;
        return SubjectFactory.loadByExternalId(home.id, SubjectType.sportTeam)
            .then(t => t! as NBATeam);
    }

    get awayTeam(): Promise<NBATeam> {
        const { away } = this.properties.json;
        return SubjectFactory.loadByExternalId(away.id, SubjectType.sportTeam)
            .then(t => t! as NBATeam);
    }

    get players(): Promise<Array<NBAPlayer>> {
        return (async () => {
            const teams = await Promise.all([this.homeTeam, this.awayTeam]);
            const [homeTeamPlayers, awayTeamPlayers] = await Promise.all(
                teams.map(t => t.getRelatedSubjects().then(s => s as Array<NBAPlayer>))
            );
            return [...homeTeamPlayers, ...awayTeamPlayers];
        })();
    }

    async toResponseObject(): Promise<INBAGameResponse> {
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
        const teams = await Promise.all([this.homeTeam, this.awayTeam]);
        const players = await this.players;
        return [
            ...teams,
            ...players
        ];
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
        const sportsApi = new NBASportsApi();
        const boxscore = await sportsApi.getGameStats(this.properties.external_id);
        this.properties.statistics = boxscore;
        await this.save();
    }
}