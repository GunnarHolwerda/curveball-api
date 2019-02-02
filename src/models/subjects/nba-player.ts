import { NBAResponse } from '../../interfaces/sports-api-responses/nba';
import { SportPlayer, SportPlayerResponse } from './sport-player';
import { NBAPlayerStatistics } from './nba-game';
import { SimpleSubjectResponse } from '../../interfaces/simple-subject-response';

export class NBAPlayer extends SportPlayer<NBAResponse.PlayerDetail> {
    async playerResponse(): Promise<SportPlayerResponse> {
        return {
            fullName: this.properties.json.full_name,
            position: this.properties.json.position
        };
    }

    calculateFantasyScore(statistics: NBAPlayerStatistics): number {
        const { points, rebounds, assists, steals, blocks, turnovers } = statistics;
        return 1 * points + 1.2 * rebounds + 1.5 * assists + 3 * steals + 3 * blocks + -1 * turnovers;
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
}