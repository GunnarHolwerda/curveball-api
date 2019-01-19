import { NBAResponse } from '../../interfaces/sports-api-responses/nba';
import { SportTeam } from './sport-team';

export class NBATeam extends SportTeam<NBAResponse.Team> {
}