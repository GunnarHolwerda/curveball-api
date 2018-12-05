import { Database } from '../database';
import { ANSWER_TABLE_NAME, Answer, IAnswer } from '../entities/answer';

export interface AnswerStats {
    count: string;
    choice_id: string;
}

export class AnswerFactory {
    public static async loadAllForQuestion(questionId: string, disabled: boolean = false): Promise<Array<Answer>> {
        const sq = Database.instance.sq;
        const result = await sq.from(ANSWER_TABLE_NAME).where`question_id = ${questionId}`.and`disabled = ${disabled}`;
        return result.map(r => new Answer(r as IAnswer));
    }

    public static async loadByQuestionAndUser(questionId: string, userId: string): Promise<Answer | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(ANSWER_TABLE_NAME)
            .where`question_id ${questionId}`
            .and`user_id = ${userId}`
            .and`disabled = ${false}`;

        if (result.length === 0) {
            return null;
        }

        return new Answer(result[0] as IAnswer);
    }

    public static async loadMostRecentForQuiz(quizId: string, userId: string): Promise<Answer | null> {
        const sq = Database.instance.sq;
        const result = await sq.from({ a: ANSWER_TABLE_NAME })
            .join({ q: 'questions' }).on`q.question_id = a.question_id`
            .where`q.quiz_id = ${quizId}`.and`a.user_id = ${userId}`
            .order`q.sent DESC`
            .limit(1);

        if (result.length === 0) {
            return null;
        }
        return new Answer(result[0] as IAnswer);

    }

    public static async load(questionId: string, userId: string, choiceId: string, disabled: boolean = false): Promise<Answer | null> {
        const sq = Database.instance.sq;
        const result = await sq.from({ a: ANSWER_TABLE_NAME })
            .where`question_id = ${questionId}`.and`a.user_id = ${userId}`.and`choice_id = ${choiceId}`.and`disabled = ${disabled}`;

        if (result.length === 0) {
            return null;
        }

        return new Answer(result[0] as IAnswer);
    }


    public static async questionResults(questionId: string): Promise<Array<AnswerStats>> {
        const sq = Database.instance.sq;
        const result = await sq.from(ANSWER_TABLE_NAME)
            .where`question_id = ${questionId}`.and`disabled = false`
            .group`choice_id`
            .return({ count: 'COUNT(*)', choice_id: 'choice_id' });

        return result as Array<AnswerStats>;
    }
}