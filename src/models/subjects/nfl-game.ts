import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';
import { NFLSportsApi } from '../data-loader/nfl-sports-api';
import { SportsApi } from '../data-loader/sports-api';
import { SportGame } from './sport-game';
import { NFLPlayer } from './nfl-player';
import { NFLTeam } from './nfl-team';
import { SimpleSubjectResponse } from '../../interfaces/simple-subject-response';

export interface NFLPassingStatistics {
    yards: number;
    touchdowns: number;
    interceptions: number;
    sacks: number;
    twoPts: number;
}

export interface NFLRushingStatistics {
    yards: number;
    touchdowns: number;
    twoPts: number;
}

export interface NFLReceivingStatistics extends NFLRushingStatistics {
    receptions: number;
}

export interface NFLFumbleStatistics {
    fumbles: number;
}

export interface NFLKickingStatistics {
    pats: number;
    fieldGoals: number;
}

export interface NFLDefensiveStats {
    touchdowns: number;
    interceptions: number;
    fumblesRecovered: number;
    blockedKicks: number;
    sacks: number;
    safeties: number;
}

export interface NFLReturnStats {
    yards: number;
    touchdowns: number;
}

export interface NFLPlayerStatistics {
    passing: NFLPassingStatistics;
    rushing: NFLRushingStatistics;
    receiving: NFLReceivingStatistics;
    kicking: NFLKickingStatistics;
    returning: NFLReturnStats;
    fumbles: NFLFumbleStatistics;
}

export class NFLGame extends SportGame<NFLResponse.Game, NFLResponse.GameStatistics> {

    getStatsForTeam(team: NFLTeam): NFLDefensiveStats {
        const { home, away } = this.properties.statistics.statistics;
        const teamStats = home.id === team.properties.external_id ? home : away;
        return this.getDefensiveStats(teamStats);
    }

    getSportsApi(): SportsApi {
        return new NFLSportsApi();
    }

    getStats<T>(type: string, team: NFLResponse.TeamStatistics, playerId: string, stats: Array<keyof T>): T {
        if (!team.hasOwnProperty(type)) {
            throw new Error('Attempting to get statistics for unknown type ' + type);
        }
        const statistics = team[type].player.find((p: NFLResponse.PlayerStatistic) => p.id === playerId) || {};
        const result = stats.reduce((carry, stat) => {
            carry[stat] = statistics[stat] || 0;
            return carry;
        }, {} as T);
        return result as T;
    }

    getKickingStats(team: NFLResponse.TeamStatistics, playerId: string): NFLKickingStatistics {
        const pats = team.extra_points.kicks.players.find(p => p.id === playerId);
        const fieldGoals = team.field_goals.players.find(p => p.id === playerId);
        return {
            pats: pats ? pats.made : 0,
            fieldGoals: fieldGoals ? fieldGoals.made : 0
        };
    }

    getDefensiveStats(team: NFLResponse.TeamStatistics): NFLDefensiveStats {
        const stats = team.defense.totals;
        return {
            touchdowns: team.touchdowns.int_return + team.touchdowns.fumble_return,
            interceptions: stats.interceptions,
            fumblesRecovered: stats.fumble_recoveries,
            blockedKicks: team.defense.totals.sp_blocks,
            sacks: stats.sacks,
            safeties: stats.safeties
        };
    }

    getReturnStats(team: NFLResponse.TeamStatistics, playerId: string): NFLReturnStats {
        const kickReturn = this.getStats<{ yards: number, touchdowns: number }>('kick_returns', team, playerId, ['yards', 'touchdowns']);
        const puntReturn = this.getStats<{ yards: number, touchdowns: number }>('punt_returns', team, playerId, ['yards', 'touchdowns']);
        return {
            yards: kickReturn.yards + puntReturn.yards,
            touchdowns: kickReturn.touchdowns + puntReturn.touchdowns
        };
    }

    getStatsForPlayer(player: NFLPlayer): NFLPlayerStatistics {
        const { home, away } = this.properties.statistics.statistics;
        const { parent_external_id: teamId, external_id: playerId } = player.properties;

        const team = home.id === teamId ? home : away;
        return {
            passing: this.getStats<NFLPassingStatistics>('passing', team, playerId, ['yards', 'touchdowns', 'interceptions', 'sacks']),
            rushing: this.getStats<NFLRushingStatistics>('rushing', team, playerId, ['yards', 'touchdowns']),
            receiving: this.getStats<NFLReceivingStatistics>('receiving', team, playerId, ['yards', 'touchdowns', 'receptions']),
            kicking: this.getKickingStats(team, playerId),
            returning: this.getReturnStats(team, playerId),
            fumbles: this.getStats<NFLFumbleStatistics>('fumbles', team, playerId, ['fumbles'])
        };
    }

    async asQuestionResponse(): Promise<SimpleSubjectResponse> {
        const { home, away, scheduled } = this.properties.json as NFLResponse.Game;
        let status: 'in-progress' | 'finished' | 'not-started' = 'not-started';
        let description = `${home.name} vs. ${away.name} @ ${scheduled.toDateString()}`;
        if (this.properties.statistics) {
            const { status: currentStatus, summary, quarter, clock } = (this.properties.statistics as NFLResponse.GameStatistics);
            const { home: h, away: a } = summary;
            status = currentStatus !== 'closed' ? 'in-progress' : 'finished';
            description = `${home.alias} ${h.points} vs. ${away.alias} ${a.points} Q${quarter} ${clock}`;
        }
        return {
            subjectId: this.properties.subject_id,
            headline: `${home.name} vs. ${away.name}`,
            status: status,
            description: description
        };
    }
}