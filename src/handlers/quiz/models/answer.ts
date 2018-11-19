import { Postgres } from '../postgres';
import { Database } from './database';
import { AnswerFactory } from './factories/answer-factory';
import { CbRedis } from './cb-redis';

export interface IAnswer {
    choice_id: string;
    question_id: string;
    user_id: string;
    life: string;
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
    ): Promise<Answer | null> {
        await Database.instance.client.query(`
            INSERT INTO ${ANSWER_TABLE_NAME} (question_id, user_id, choice_id)
            VALUES ($1, $2, $3);
        `, [questionId, userId, choiceId]);
        await CbRedis.instance.client.set(`answer-${quizId}-${questionId}-${userId}`, true);
        return AnswerFactory.load(questionId, userId, choiceId);
    }

    public static async existsForUser(quizId: string, questionId: string, userId: string): Promise<boolean> {
        return +(await CbRedis.instance.client.exists(`answer-${quizId}-${questionId}-${userId}`)) === 1;
    }

    public async save(): Promise<void> {
        await Database.instance.client.query(`
            UPDATE ${ANSWER_TABLE_NAME}
            SET
                ${Postgres.buildUpatePropertyString(this._answer, this.properties)}
            WHERE question_id = $1 AND user_id = $2 AND choice_id = $3;
        `, [this._answer.question_id, this._answer.user_id, this._answer.choice_id]);
    }
}