import { Scorer } from './scorer';
import { Choice } from '../entities/question-choice';
import { SportGame } from '../../interfaces/sport-game';
import { SportTeam } from '../subjects/sport-team';

export class SpreadScorer extends Scorer {
    async calculateScoreForSubject(selectedTeam: SportTeam<object>, choice: Choice): Promise<number> {
        const selectionIsFavored = choice.properties.text.startsWith('-');
        const questionSubject: SportGame = (await this.question.subject<SportGame>())!;
        const home = questionSubject.getHomeTeam();
        const away = questionSubject.getAwayTeam();
        const hasSelectedHomeTeam = selectedTeam.properties.external_id === home.id;
        let favoredTeamPoints: number, underdogTeamPoints: number;
        if (selectionIsFavored) {
            if (hasSelectedHomeTeam) {
                favoredTeamPoints = home.points;
                underdogTeamPoints = away.points;
            } else {
                favoredTeamPoints = away.points;
                underdogTeamPoints = home.points;
            }
        } else {
            if (hasSelectedHomeTeam) {
                favoredTeamPoints = away.points;
                underdogTeamPoints = home.points;
            } else {
                favoredTeamPoints = home.points;
                underdogTeamPoints = away.points;
            }
        }

        const difference = underdogTeamPoints - favoredTeamPoints;
        const line = -1 * Math.abs(parseInt(choice.properties.text, 10));

        if (difference + line === 0) {
            return 0;
        } else if (difference < line) {
            // Failed to cover
            return selectionIsFavored ? 1 : 0;
        } else if (difference > line) {
            // Covered
            return selectionIsFavored ? 0 : 1;
        } else {
            throw new Error('Spread miscalculation');
        }
    }
}