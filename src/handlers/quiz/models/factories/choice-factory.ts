import { Database } from '../database';
import { Choice, IChoice, CHOICES_TABLE_NAME } from '../question-choice';
import { CurveballNotFound } from '../curveball-error';

export class ChoiceFactory {
    public static async load(choiceId: string): Promise<Choice> {
        const result = await Database.instance.client.query(`
                                        SELECT *
                                        FROM ${CHOICES_TABLE_NAME}
                                        WHERE choice_id = $1;
                                    `, [choiceId]);

        if (result.rows.length === 0) {
            throw new CurveballNotFound();
        }
        return new Choice(result.rows[0] as IChoice);
    }

    public static async loadAllForQuestion(questionId: string): Promise<Array<Choice>> {
        const result = await Database.instance.client.query(`
                                        SELECT *
                                        FROM ${CHOICES_TABLE_NAME}
                                        WHERE question_id = $1;
                                    `, [questionId]);

        return result.rows.map(r => new Choice(r));
    }
}