import { Scorer } from './scorer';
import { Choice } from '../entities/question-choice';
import { BasicSportGame } from '../../interfaces/basic-sport-game';
import { SportTeam } from '../subjects/sport-team';

export class SpreadScorer extends Scorer {
    async calculateScoreForSubject(selectedTeam: SportTeam<object>, choice: Choice<{ spread: string }>): Promise<number> {
        const selectionIsFavored = choice.properties.data.spread.startsWith('-');
        const questionSubject: BasicSportGame = (await this.question.subject<BasicSportGame>())!;
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
        const line = -1 * Math.abs(parseInt(choice.properties.data.spread, 10));

        if (difference + line === 0) {
            return 0;
        } else if (difference < line) {
            // Failed to cover
            return selectionIsFavored ? 1 : 0;
        } else if (difference > line) {
            // Covered
            return selectionIsFavored ? 0 : 1;
        } else {
            throw new Error(`Spread miscalculation\nDifference: ${difference}\nLine: ${line}`);
        }
    }
}