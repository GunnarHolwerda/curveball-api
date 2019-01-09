
import { Database } from '../database';
import { QUESTION_TYPE_TABLE_NAME, QuestionType, IQuestionType } from '../entities/question-type';

export class QuestionTypeFactory {
    public static async load(typeId: number): Promise<QuestionType | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(QUESTION_TYPE_TABLE_NAME).where`id = ${typeId}`;

        if (result.length === 0) {
            return null;
        }
        return new QuestionType(result[0] as IQuestionType);
    }

    public static async loadAll(): Promise<Array<QuestionType>> {
        const sq = Database.instance.sq;
        const result = await sq.from(QUESTION_TYPE_TABLE_NAME);
        return result.map(r => new QuestionType(r as IQuestionType));
    }
}