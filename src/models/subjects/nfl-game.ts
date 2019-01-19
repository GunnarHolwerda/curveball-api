import { Subject, ISubject } from '../entities/subject';
import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';
import { camelizeKeys } from '../../util/camelize-keys';
import { SubjectFactory } from '../factories/subject-factory';
import { SubjectType } from '../../types/subject-type';
import { SubjectTableResponse } from '../../interfaces/subject-table-response';
import { NFLTeam } from './nfl-team';
import { NFLPlayer } from './nfl-player';
import { SportGame } from '../../interfaces/sport-game';
import { NFLSportsApi } from '../data-loader/nfl-sports-api';
import { ISportTeamResponse } from './sport-team';

export interface INFLGame extends ISubject {
    external_id: string;
    topic: number;
    parent_external_id: string;
    created: Date;
    updated: Date;
    deleted: boolean;
    json: NFLResponse.Game;
    statistics: NFLResponse.GameStatistics;
}

export interface NFLGameResponse {
    home: ISportTeamResponse;
    away: ISportTeamResponse;
    date: string;
}

export interface INFLGameResponse extends SubjectTableResponse {
    game: NFLGameResponse;
}

export class NFLGame extends Subject<INFLGame> implements SportGame {
    constructor(properties: INFLGame) {
        super(properties);
    }

    get homeTeam(): Promise<NFLTeam> {
        const { home } = this.properties.json;
        return SubjectFactory.loadByExternalId(home.id, SubjectType.sportTeam)
            .then(t => t! as NFLTeam);
    }

    get awayTeam(): Promise<NFLTeam> {
        const { away } = this.properties.json;
        return SubjectFactory.loadByExternalId(away.id, SubjectType.sportTeam)
            .then(t => t! as NFLTeam);
    }

    get players(): Promise<Array<NFLPlayer>> {
        return (async () => {
            const teams = await Promise.all([this.homeTeam, this.awayTeam]);
            const [homeTeamPlayers, awayTeamPlayers] = await Promise.all(
                teams.map(t => t.getRelatedSubjects().then(s => s as Array<NFLPlayer>))
            );
            return [...homeTeamPlayers, ...awayTeamPlayers];
        })();
    }

    async toResponseObject(): Promise<INFLGameResponse> {
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
        return this.properties.statistics.summary.home;
    }
    getAwayTeam(): { id: string; points: number; } {
        return this.properties.statistics.summary.away;
    }

    async updateStatistics(): Promise<void> {
        const nflSportsApi = new NFLSportsApi();
        const boxscore = await nflSportsApi.getGameStats(this.properties.external_id);
        this.properties.statistics = boxscore;
        await this.save();
    }
}