import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';
import { NFLSportsApi } from '../data-loader/nfl-sports-api';
import { SportsApi } from '../data-loader/sports-api';
import { SportGame } from './sport-game';
import { NFLPlayer } from './nfl-player';
import { NFLTeam } from './nfl-team';
import { SimpleSubjectResponse } from '../../interfaces/simple-subject-response';
import { SubjectFactory } from '../factories/subject-factory';
import { SubjectType } from '../../types/subject-type';

export interface NFLPassingStatistics {
    yds: number;
    td: number;
    int: number;
    sk: number;
}

export interface NFLRushingStatistics {
    yds: number;
    td: number;
}

export interface NFLReceivingStatistics extends NFLRushingStatistics {
    rec: number;
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

export class NFLGame extends SportGame<NFLResponse.GamesEntity, NFLResponse.GameStatistics> {

    get homeTeam(): Promise<NFLTeam> {
        const { home } = this.properties.json;
        return SubjectFactory.loadByExternalId(home, SubjectType.sportTeam)
            .then(t => t! as NFLTeam);
    }

    get awayTeam(): Promise<NFLTeam> {
        const { away } = this.properties.json;
        return SubjectFactory.loadByExternalId(away, SubjectType.sportTeam)
            .then(t => t! as NFLTeam);
    }

    getStatsForTeam(team: NFLTeam): NFLDefensiveStats {
        const { home_team: home, away_team: away } = this.properties.statistics as NFLResponse.GameStatistics;
        const teamStats = home.id === team.properties.external_id ? home : away;
        const { touchdowns, defense } = teamStats.statistics;
        return this.getDefensiveStats(defense.team, touchdowns.team);
    }

    getSportsApi(): SportsApi {
        return new NFLSportsApi();
    }

    getStats<T>(type: string, team: NFLResponse.Statistics, playerId: string, stats: Array<keyof T>): T {
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

    getKickingStats(
        fieldGoalStats: NFLResponse.FieldGoal,
        extraPointStats: NFLResponse.ExtraPoint,
        playerId: string
    ): NFLKickingStatistics {
        const pats = extraPointStats.players!.find(p => p.id === playerId);
        const fieldGoals = fieldGoalStats.players!.find(p => p.id === playerId);
        return {
            pats: pats ? pats.made : 0,
            fieldGoals: fieldGoals ? fieldGoals.made : 0 // TODO: Update to include length of kicks
        };
    }

    getDefensiveStats(team: NFLResponse.TeamDefenseStatistics, touchdownStats: NFLResponse.TeamTouchdownStatistics): NFLDefensiveStats {
        return {
            touchdowns: touchdownStats.int + touchdownStats.fum_ret,
            interceptions: team.int,
            fumblesRecovered: team.fum_rec,
            blockedKicks: team.bk,
            sacks: team.sack,
            safeties: team.sfty
        };
    }

    getReturnStats(
        teamStats: NFLResponse.Statistics,
        playerId: string
    ): NFLReturnStats {
        const kickReturn = this.getStats<{ yds: number, td: number }>('kick_returns', teamStats, playerId, ['yds', 'td']);
        const puntReturn = this.getStats<{ yds: number, td: number }>('punt_returns', teamStats, playerId, ['yds', 'td']);
        return {
            yards: kickReturn.yds + puntReturn.yds,
            touchdowns: kickReturn.td + puntReturn.td
        };
    }

    getStatsForPlayer(player: NFLPlayer): NFLPlayerStatistics {
        const { home_team: home, away_team: away } = this.properties.statistics as NFLResponse.GameStatistics;
        const { parent_external_id: teamId, external_id: playerId } = player.properties;

        const team = home.id === teamId ? home : away;
        const { statistics } = team;
        return {
            passing: this.getStats<NFLPassingStatistics>('passing', statistics, playerId, ['yds', 'td', 'int', 'sk']),
            rushing: this.getStats<NFLRushingStatistics>('rushing', statistics, playerId, ['yds', 'td']),
            receiving: this.getStats<NFLReceivingStatistics>('receiving', statistics, playerId, ['yds', 'td', 'rec']),
            kicking: this.getKickingStats(statistics.field_goal, team.statistics.extra_point, playerId),
            returning: this.getReturnStats(statistics, playerId),
            fumbles: this.getStats<NFLFumbleStatistics>('fumbles', statistics, playerId, ['fumbles'])
        };
    }

    async asQuestionResponse(): Promise<SimpleSubjectResponse> {
        // TODO: FIXXIXIXIIXIXII May need to retrieve the box score
        // const { home_team: home, away_team: away, scheduled } = this.properties.json as NFLResponse.GameStatistics;
        // let status: 'in-progress' | 'finished' | 'not-started' = 'not-started';
        // const gameDate = new Date(Date.parse(scheduled));
        // const gameDateString = `${gameDate.getMonth() + 1}/${gameDate.getDate()}/${gameDate.getFullYear()}`;
        // let description = `${home.alias} @ ${away.alias} / ${gameDateString}`;
        // if (this.properties.statistics) {
        //     const { status: currentStatus, summary, quarter, clock } = (this.properties.statistics as NFLResponse.GameStatistics);
        //     const { home: h, away: a } = summary;
        //     status = currentStatus !== 'closed' ? 'in-progress' : 'finished';
        //     description = `${away.alias} ${a.points} @ ${home.alias} ${h.points} / ${clock} Q${quarter}`;
        // }
        // return {
        //     subjectId: this.properties.subject_id,
        //     headline: `${home.name} vs. ${away.name}`,
        //     status: status,
        //     description: description
        // };
        return {
            subjectId: 0,
            headline: '',
            status: 'in-progress',
            description: ''
        };
    }
}