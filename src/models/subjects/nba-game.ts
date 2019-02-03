import { BasicSportGame } from '../../interfaces/basic-sport-game';
import { NBAResponse } from '../../interfaces/sports-api-responses/nba';
import { SportGame } from './sport-game';
import { NBASportsApi } from '../data-loader/nba-sports-api';
import { NBAPlayer } from './nba-player';
import { NBATeam } from './nba-team';
import { SimpleSubjectResponse } from '../../interfaces/simple-subject-response';

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

    async asQuestionResponse(): Promise<SimpleSubjectResponse> {
        const { home, away, scheduled } = this.properties.json as NBAResponse.Game;
        let status: 'in-progress' | 'finished' | 'not-started' = 'not-started';
        let description = `${home.name} vs. ${away.name} @ ${scheduled.toDateString()}`;
        if (this.properties.statistics) {
            const { status: currentStatus, home: h, away: a, quarter, clock } = (this.properties.statistics as NBAResponse.GameStatistics);
            status = currentStatus !== 'closed' ? 'in-progress' : 'finished';
            description = `${away.alias} ${a.points} @ ${home.alias} ${h.points} / ${clock} Q${quarter}`;
        }
        return {
            subjectId: this.properties.subject_id,
            headline: `${home.name} vs. ${away.name}`,
            status: status,
            description: description
        };
    }
}