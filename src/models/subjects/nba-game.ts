import { BasicSportGame } from '../../interfaces/basic-sport-game';
import { NBAResponse } from '../../interfaces/sports-api-responses/nba';
import { SportGame } from './sport-game';
import { NBASportsApi } from '../data-loader/nba-sports-api';
import { NBAPlayer } from './nba-player';
import { NBATeam } from './nba-team';

export interface NBAPlayerStatistics {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
}

export class NBAGame extends SportGame<NBAResponse.Game, NBAResponse.GameStatistics> implements BasicSportGame {

    getStatsForTeam(_: NBATeam): null {
        // NBA Teams don't get selected for fantasy
        return null;
    }

    getStatsForPlayer(player: NBAPlayer): NBAPlayerStatistics {
        const { parent_external_id: teamId, external_id: playerId } = player.properties;
        const { home, away } = this.properties.statistics as NBAResponse.GameStatistics;
        const team = home.id === teamId ? home : away;
        const playerStats = team.players.find(p => p.id === playerId);
        if (playerStats === undefined) {
            return {
                points: 0,
                rebounds: 0,
                assists: 0,
                steals: 0,
                blocks: 0,
                turnovers: 0
            };
        }
        const { points, rebounds, assists, blocks, steals, turnovers } = playerStats.statistics;
        return {
            points, rebounds, assists, blocks, steals, turnovers
        };
    }

    getSportsApi(): NBASportsApi {
        return new NBASportsApi();
    }
}