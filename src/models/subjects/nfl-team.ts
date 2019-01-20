import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';
import { SportTeam } from './sport-team';
import { FantasySubject } from '../../interfaces/fantasy-subject';
import { NFLDefensiveStats } from './nfl-game';

export class NFLTeam extends SportTeam<NFLResponse.Team> implements FantasySubject {
    calculateFantasyScore(statistics: NFLDefensiveStats): number {
        const { touchdowns, interceptions, fumblesRecovered, blockedKicks, sacks, safeties } = statistics;
        return 6 * touchdowns + 2 * fumblesRecovered + 2 * interceptions + 2 * blockedKicks * 1 * sacks + 2 * safeties;
    }
}