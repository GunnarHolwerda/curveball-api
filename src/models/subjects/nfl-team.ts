import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';
import { SportTeam } from './sport-team';

export class NFLTeam extends SportTeam<NFLResponse.Team> {
}