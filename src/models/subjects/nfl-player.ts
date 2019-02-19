import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';
import {
    NFLFumbleStatistics,
    NFLKickingStatistics,
    NFLPassingStatistics,
    NFLPlayerStatistics,
    NFLReceivingStatistics,
    NFLReturnStats,
    NFLRushingStatistics
} from './nfl-game';
import { SportPlayer, SportPlayerResponse } from './sport-player';
import { SimpleSubjectResponse } from '../../interfaces/simple-subject-response';


export class NFLPlayer extends SportPlayer<NFLResponse.PlayersEntity> {

    async playerResponse(): Promise<SportPlayerResponse> {
        return {
            fullName: this.properties.json.name_full,
            position: this.properties.json.position
        };
    }

    calculateFantasyScore(statistics: NFLPlayerStatistics): number {
        const passingScore = this.calculatePassingScore(statistics.passing);
        const rushingScore = this.calculateRushingScore(statistics.rushing);
        const receivingScore = this.calculateReceivingScore(statistics.receiving);
        const returnScore = this.calculateReturnScore(statistics.returning);
        const fumbleScore = this.calculateFumbleScore(statistics.fumbles);
        const kickingScore = this.calculateKickingScore(statistics.kicking);
        return passingScore + rushingScore + receivingScore + returnScore + fumbleScore + kickingScore;
    }

    async asQuestionResponse(): Promise<SimpleSubjectResponse> {
        const { fullName, position } = await this.playerResponse();
        // TODO: Load current game information for player and then populate status and description from that
        return {
            subjectId: this.properties.subject_id,
            headline: fullName,
            status: 'in-progress',
            description: position
        };
    }

    private calculateKickingScore(statistics: NFLKickingStatistics): number {
        const { pats, fieldGoals } = statistics;
        return 1 * pats + 3 * fieldGoals;
    }

    private calculateFumbleScore(statistics: NFLFumbleStatistics): number {
        const { fumbles } = statistics;
        return -1 * fumbles;
    }

    private calculateReturnScore(statistics: NFLReturnStats): number {
        const { yards, touchdowns } = statistics;
        return 0 * yards + 6 * touchdowns;
    }

    private calculateReceivingScore(statistics: NFLReceivingStatistics): number {
        const { yds: yards, rec: receptions, td: touchdowns } = statistics;
        return 1 * receptions + .1 * yards + 6 * touchdowns;
    }

    private calculateRushingScore(statistics: NFLRushingStatistics): number {
        const { yds: yards, td: touchdowns } = statistics;
        return 0.1 * yards + 6 * touchdowns;
    }

    private calculatePassingScore(statistics: NFLPassingStatistics): number {
        const { yds: yards, td: touchdowns, int: interceptions, sk: sacks } = statistics;
        return 0.04 * yards + 4 * touchdowns + -2 * interceptions + 0 * sacks;
    }
}