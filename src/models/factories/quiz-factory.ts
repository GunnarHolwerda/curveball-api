import { Quiz, IQuiz, QUIZZES_TABLE_NAME } from '../entities/quiz';
import { Database } from '../database';

export class QuizFactory {

    public static async load(quizId: string): Promise<Quiz | null> {
        const result = await Database.instance.client.query(`
                                            SELECT *
                                            FROM ${QUIZZES_TABLE_NAME}
                                            WHERE quiz_id = $1;
                                        `, [quizId]);
        if (result.rows.length === 0) {
            return null;
        }
        return new Quiz(result.rows[0] as IQuiz);
    }

    public static async loadAll(includeDeleted: boolean = false): Promise<Array<Quiz>> {
        const q = Database.instance.sq;
        let query = q.from`quizzes`.where`deleted = ${false}`;
        if (includeDeleted) {
            query = query.or`deleted = ${true}`;
        }

        const result = await query;
        return result.map(r => new Quiz(r as IQuiz));
    }
}