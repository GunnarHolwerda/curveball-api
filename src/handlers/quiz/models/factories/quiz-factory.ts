import { Quiz, IQuiz, QUIZZES_TABLE_NAME } from '../quiz';
import { CurveballNotFound } from '../curveball-error';
import { Database } from '../database';

export class QuizFactory {

    public static async load(quizId: string): Promise<Quiz> {
        const result = await Database.instance.client.query(`
                                            SELECT *
                                            FROM ${QUIZZES_TABLE_NAME}
                                            WHERE quiz_id = $1;
                                        `, [quizId]);
        if (result.rows.length === 0) {
            throw new CurveballNotFound();
        }
        return new Quiz(result.rows[0] as IQuiz);
    }

    public static async loadAll(): Promise<Array<Quiz>> {
        const result = await Database.instance.client.query(`SELECT * FROM ${QUIZZES_TABLE_NAME};`);
        return result.rows.map(r => new Quiz(r));
    }
}