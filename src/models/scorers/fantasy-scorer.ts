import { Scorer } from './scorer';
import { Choice } from '../entities/question-choice';
import { SportPlayer } from '../subjects/sport-player';

export class SportsFantasyScorer extends Scorer {
    async calculateScoreForSubject(selectedPlayer: SportPlayer<object>, _: Choice): Promise<number> {
        const team = await selectedPlayer.getTeam();
        const game = await team.gameOnDay(new Date());
        const stats = game.getStatsForPlayer(selectedPlayer);

        // Return the total score;
        return selectedPlayer.calculateFantasyScore(stats);
    }
}