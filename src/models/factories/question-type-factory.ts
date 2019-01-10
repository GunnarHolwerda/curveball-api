
import { Database } from '../database';
import { QUESTION_TYPE_TABLE_NAME, QuestionType, IQuestionType } from '../entities/question-type';
import { Row } from 'sqorn-pg/types/methods';
import { QUESTION_CALCULATOR_TABLE_NAME } from '../entities/question-calculator';
import { TOPIC_TABLE_NAME } from './topic-factory';

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
        return this.buildTypes(result);
    }

    public static async loadAllAvailableForTopic(topicId: number): Promise<Array<QuestionType>> {
        const sq = Database.instance.sq;
        const GenericTypes = sq.from(QUESTION_TYPE_TABLE_NAME).where`generic = TRUE`;
        const TypesForTopic = sq.from({ qt: QUESTION_TYPE_TABLE_NAME })
            .join({ qc: QUESTION_CALCULATOR_TABLE_NAME }).on`qt.id = qc.type_id`
            .join({ t: TOPIC_TABLE_NAME }).on`t.topic_id = qc.topic`
            .where`t.topic_id = ${topicId}`.return(sq.l`qt.*`);

        const result = await GenericTypes.union(TypesForTopic);
        return this.buildTypes(result);
    }

    private static buildTypes(result: Array<Row>): Array<QuestionType> {
        return result.map(r => new QuestionType(r as IQuestionType));
    }
}