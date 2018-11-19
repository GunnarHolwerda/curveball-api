import { Database } from '../database';
import { ANSWER_TABLE_NAME, Answer, IAnswer } from '../answer';

export interface AnswerStats {
    count: number;
    choice_id: string;
}

export class AnswerFactory {
    public static async loadAllForQuestion(questionId: string, disabled: boolean = false): Promise<Array<Answer>> {
        const result = await Database.instance.client.query(`
                SELECT *
                FROM ${ANSWER_TABLE_NAME}
                WHERE question_id = $1 AND disabled = $2;
            `, [questionId, disabled]);

        return result.rows.map(r => new Answer(r));
    }

    public static async loadByQuestionAndUser(questionId: string, userId: string): Promise<Answer | null> {
        const result = await Database.instance.client.query(`
                SELECT *
                FROM ${ANSWER_TABLE_NAME}
                WHERE question_id = $1 AND user_id = $2 AND disabled = false;
            `, [questionId, userId]);

        if (result.rowCount === 0) {
            return null;
        }

        return new Answer(result.rows[0] as IAnswer);
    }

    public static async loadMostRecentForQuiz(quizId: string, userId: string): Promise<Answer | null> {
        const result = await Database.instance.client.query(`
            SELECT *
            FROM ${ANSWER_TABLE_NAME} a
                JOIN questions q ON q.question_id = a.question_id
            WHERE a.quiz_id = $1 AND a.user_id = userId
            ORDER BY q.sent DESC
            LIMIT 1;
        `, [quizId, userId]);

        if (result.rowCount === 0) {
            return null;
        }
        return new Answer(result.rows[0]);

    }

    public static async load(questionId: string, userId: string, choiceId: string, disabled: boolean = false): Promise<Answer | null> {
        const result = await Database.instance.client.query(`
                                        SELECT *
                                        FROM ${ANSWER_TABLE_NAME}
                                        WHERE question_id = $1 AND user_id = $2 AND choice_id = $3 AND disabled = $4;
                                    `, [questionId, userId, choiceId, disabled]);

        if (result.rowCount === 0) {
            return null;
        }

        return new Answer(result.rows[0] as IAnswer);
    }


    public static async questionResults(questionId: string): Promise<Array<AnswerStats>> {
        const result = await Database.instance.client.query(`
            SELECT COUNT(*), choice_id
            FROM ${ANSWER_TABLE_NAME}
            WHERE question_id = $1 AND disabled = false
            GROUP BY choice_id;
            `, [questionId]);

        return result.rows as Array<AnswerStats>;
    }
}