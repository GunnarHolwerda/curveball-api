import { Quiz, IQuiz, QUIZZES_TABLE_NAME } from '../entities/quiz';
import { Database } from '../database';

export class QuizFactory {

    public static async load(quizId: string): Promise<Quiz | null> {
        const q = Database.instance.sq;
        const result = await q.from(QUIZZES_TABLE_NAME).where`quiz_id = ${quizId}`;
        if (result.length === 0) {
            return null;
        }
        return new Quiz(result[0] as IQuiz);
    }

    public static async loadAll(includeDeleted: boolean = false): Promise<Array<Quiz>> {
        const q = Database.instance.sq;
        let query = q.from(QUIZZES_TABLE_NAME).where`deleted = ${false}`.order({ by: 'created', sort: 'desc' });
        if (includeDeleted) {
            query = query.or`deleted = ${true}`;
        }

        const result = await query;
        return result.map(r => new Quiz(r as IQuiz));
    }
}