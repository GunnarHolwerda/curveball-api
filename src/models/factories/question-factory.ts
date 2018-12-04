
import { Database } from '../database';
import { Question, QUESTION_TABLE_NAME, IQuestion } from '../entities/question';

export class QuestionFactory {
    public static async load(questionId: string): Promise<Question | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(QUESTION_TABLE_NAME).where`question_id = ${questionId}`;

        if (result.length === 0) {
            return null;
        }
        return new Question(result[0] as IQuestion);
    }

    public static async loadAllForQuiz(quizId: string): Promise<Array<Question>> {
        const sq = Database.instance.sq;
        const result = await sq.from(QUESTION_TABLE_NAME).where`quiz_id = ${quizId}`.order`question_num ASC`;
        return result.map((r) => {
            return new Question(r as IQuestion);
        });
    }

    public static async loadLastSentForQuiz(quizId: string): Promise<Question | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(QUESTION_TABLE_NAME).where`quiz_id = ${quizId}`.and`sent IS NOT NULL`.order`question_num ASC`;
        if (result.length === 0) {
            return null;
        }
        return new Question(result[0] as IQuestion);
    }
}