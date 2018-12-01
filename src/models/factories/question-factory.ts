
import { Database } from '../database';
import { Question, QUESTION_TABLE_NAME, IQuestion } from '../entities/question';

export class QuestionFactory {
    public static async load(questionId: string): Promise<Question | null> {
        const result = await Database.instance.client.query(`
            SELECT * FROM ${QUESTION_TABLE_NAME} where question_id = $1;
        `, [questionId]);

        if (result.rowCount === 0) {
            return null;
        }
        return new Question(result.rows[0]);
    }

    public static async loadAllForQuiz(quizId: string): Promise<Array<Question>> {
        const result = await Database.instance.client.query(`
                                        SELECT *
                                        FROM ${QUESTION_TABLE_NAME}
                                        WHERE quiz_id = $1
                                        ORDER BY question_num ASC;
                                    `, [quizId]);
        return result.rows.map((r: IQuestion) => {
            return new Question(r);
        });
    }

    public static async loadLastSentForQuiz(quizId: string): Promise<Question | null> {
        const result = await Database.instance.client.query(`
                                        SELECT *
                                        FROM ${QUESTION_TABLE_NAME}
                                        WHERE quiz_id = $1 AND sent IS NOT NULL
                                        ORDER BY question_num ASC;
                                    `, [quizId]);

        if (result.rowCount === 0) {
            return null;
        }
        return new Question(result.rows[0]);
    }
}