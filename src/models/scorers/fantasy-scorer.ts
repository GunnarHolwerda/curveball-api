import { Scorer } from './scorer';
import { Choice } from '../entities/question-choice';
import { SportPlayer } from '../subjects/sport-player';
import { NFLTeam } from '../subjects/nfl-team';

export class SportsFantasyScorer extends Scorer {
    async calculateScoreForSubject(subject: SportPlayer<object> | NFLTeam, _: Choice): Promise<number> {
        // TODO: Eventually move all scoring into it's own class so it isn't spread amongs subjects
        if (subject instanceof SportPlayer) {
            const team = await subject.getTeam();
            const game = await team.gameOnDay(new Date());
            const stats = game.getStatsForPlayer(subject);
            return subject.calculateFantasyScore(stats);
        } else if (subject instanceof NFLTeam) {
            const game = await subject.gameOnDay(new Date());
            const stats = game.getStatsForTeam(subject);
            return subject.calculateFantasyScore(stats);
        } else {
            throw new Error('Unsupported subject' + subject);
        }
    }
}