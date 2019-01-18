import { Scorer } from './scorer';
import { Choice } from '../entities/question-choice';
import { NFLGame } from '../subjects/nfl-game';
import { SubjectFactory } from '../factories/subject-factory';
import { SubjectType } from '../../types/subject-type';
import { NFLTeam } from '../subjects/nfl-team';

export class NflSpreadScorer extends Scorer {
    async calculateScoreForSubject(subject: NFLGame, choice: Choice): Promise<number> {
        const selectedTeam = await SubjectFactory.load(choice.properties.subject_id!, SubjectType.sportPlayer) as NFLTeam;
        const { home, away } = subject.properties.statistics.summary;

        const selectionIsFavored = choice.properties.text.startsWith('-');
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

        if (difference < line) {
            // Failed to cover
            return selectionIsFavored ? 1 : 0;
        } else if (difference > line) {
            // Covered
            return selectionIsFavored ? 0 : 1;
        } else {
            // push
            return 0;
        }
    }
}