import { Database } from '../database';
import { CbRedis } from '../cb-redis';
import { omit } from '../../util/omit';

export interface IAnswer {
    answer_id: number;
    choice_id: string;
    question_id: string;
    user_id: string;
    life: number;
    submitted: Date;
    disabled: boolean;
}

export const ANSWER_TABLE_NAME = 'answer_submission';

export class Answer {
    public properties: IAnswer;

    constructor(private _answer: IAnswer) {
        this.properties = { ...this._answer };
    }

    public static async create(
        quizId: string,
        questionId: string,
        userId: string,
        choiceId: string
    ): Promise<string> {
        const sq = Database.instance.sq;
        const result = await sq.from(ANSWER_TABLE_NAME).insert({
            question_id: questionId,
            user_id: userId,
            choice_id: choiceId
        }).return`answer_id`;
        await CbRedis.instance.client.set(`answer-${quizId}-${questionId}-${userId}`, true);
        return result[0].answer_id;
    }

    public static async existsForUser(quizId: string, questionId: string, userId: string): Promise<boolean> {
        return +(await CbRedis.instance.client.exists(`answer-${quizId}-${questionId}-${userId}`)) === 1;
    }

    public async save(): Promise<void> {
        const sq = Database.instance.sq;
        await sq.from(ANSWER_TABLE_NAME).set({ ...omit(this.properties, ['answer_id']) }).where`answer_id = ${this._answer.answer_id}`;
    }
}