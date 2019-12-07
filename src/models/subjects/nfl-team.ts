import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';
import { SportTeam } from './sport-team';
import { FantasySubject } from '../../interfaces/fantasy-subject';
import { NFLDefensiveStats } from './nfl-game';
import { SimpleSubjectResponse } from '../../interfaces/simple-subject-response';

export class NFLTeam extends SportTeam<NFLResponse.Teams> implements FantasySubject {
    calculateFantasyScore(statistics: NFLDefensiveStats): number {
        const { touchdowns, interceptions, fumblesRecovered, blockedKicks, sacks, safeties } = statistics;
        return 6 * touchdowns + 2 * fumblesRecovered + 2 * interceptions + 2 * blockedKicks * 1 * sacks + 2 * safeties;
    }

    async asQuestionResponse(): Promise<SimpleSubjectResponse> {
        return {
            subjectId: this.properties.subject_id,
            headline: this.properties.json.name,
            status: 'in-progress',
            description: this.properties.json.alias
        };
    }
}