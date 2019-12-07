import { Quiz, IQuiz, QUIZZES_TABLE_NAME } from '../entities/quiz';
import { Database } from '../database';
import { Row } from 'sqorn-pg/types/methods';

export class QuizFactory {

    public static async load(quizId: string): Promise<Quiz | null> {
        const q = Database.instance.sq;
        const result = await q.from(QUIZZES_TABLE_NAME).where`quiz_id = ${quizId}`;
        if (result.length === 0) {
            return null;
        }
        return new Quiz(result[0] as IQuiz);
    }

    public static async batchLoad(quizIds: Array<string>): Promise<Array<Quiz>> {
        if (quizIds.length === 0) {
            return [];
        }
        const sq = Database.instance.sq;
        const quizIdToIndexMap: { [quizId: string]: number } = quizIds.reduce((carry, id, index) => {
            carry[id] = index;
            return carry;
        }, {});
        const result = await sq.from(QUIZZES_TABLE_NAME).where(sq.raw(`quiz_id IN (${quizIds.map(i => `'${i}'`).join(',')})`));
        if (result.length === 0) {
            return [];
        }
        const reorderedQuizzes: Array<Row> = [];
        result.forEach(r => {
            reorderedQuizzes[quizIdToIndexMap[r.quiz_id]] = r;
        });
        return reorderedQuizzes.map(r => new Quiz(r as IQuiz));
    }

    public static async loadAllForNetwork(networkId: number, includeDeleted: boolean = false): Promise<Array<Quiz>> {
        const q = Database.instance.sq;
        let query = q.from(QUIZZES_TABLE_NAME)
            .where`deleted = ${false}`
            .where`network_id = ${networkId}`
            .order({ by: 'created', sort: 'desc' });
        if (includeDeleted) {
            query = query.or`deleted = ${true}`;
        }

        const result = await query;
        return result.map(r => new Quiz(r as IQuiz));
    }
}