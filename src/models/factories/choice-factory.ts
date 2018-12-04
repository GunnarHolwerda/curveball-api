import { Database } from '../database';
import { Choice, IChoice, CHOICES_TABLE_NAME } from '../entities/question-choice';

export class ChoiceFactory {
    public static async load(choiceId: string): Promise<Choice | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(CHOICES_TABLE_NAME).where`choice_id = ${choiceId}`;
        if (result.length === 0) {
            return null;
        }
        return new Choice(result[0] as IChoice);
    }

    public static async loadAllForQuestion(questionId: string): Promise<Array<Choice>> {
        const sq = Database.instance.sq;
        const result = await sq.from(CHOICES_TABLE_NAME).where`question_id = ${questionId}`;
        return result.map(r => new Choice(r as IChoice));
    }
}