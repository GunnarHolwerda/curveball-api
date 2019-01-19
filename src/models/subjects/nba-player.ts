import { NBAResponse } from '../../interfaces/sports-api-responses/nba';
import { SportPlayer } from './sport-player';

export class NBAPlayer extends SportPlayer<NBAResponse.Player> {
}