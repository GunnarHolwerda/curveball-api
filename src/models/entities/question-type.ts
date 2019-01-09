import { Database } from '../database';
import { QuestionTypeFactory } from '../factories/question-type-factory';
import { camelizeKeys } from '../../util/camelize-keys';

export interface IQuestionType {
    id: number;
    title: string;
    description: string;
}

export const QUESTION_TYPE_TABLE_NAME = 'question_type';

export class QuestionType {
    public properties: IQuestionType;

    constructor(private _questionType: IQuestionType) {
        this.properties = { ...this._questionType };
    }

    public static async create(qt: Pick<IQuestionType, 'title' | 'description'>): Promise<QuestionType> {
        const sq = Database.instance.sq;
        const result = await sq.from(QUESTION_TYPE_TABLE_NAME).insert({ ...qt }).return`id`;
        return (await QuestionTypeFactory.load(result[0].id as number))!;
    }

    public toResponseObject(): Promise<IQuestionType> {
        return camelizeKeys({
            ...this.properties
        });
    }
}