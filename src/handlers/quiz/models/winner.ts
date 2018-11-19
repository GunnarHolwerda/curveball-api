import { StoredRecord } from './stored-record';
import { Quiz } from './quiz';
import { User } from './user';
import { Database } from './database';

export interface IWinner extends StoredRecord {
    userId: string;
    quizId: string;
    amountWon: number;
}

export const WINNER_TABLE_NAME: string = process.env.WINNER_TABLE!;

export class Winner {
    public properties: IWinner;

    static async batchCreate(participants: Array<User>, quiz: Quiz, amountWon: number): Promise<void> {
        const values = participants.map(p => `(${quiz.properties.quiz_id}, ${p.properties.user_id}, ${amountWon})`);
        await Database.instance.client.query(`
            INSERT INTO ${WINNER_TABLE_NAME} (quiz_id, user_id, amount_won) VALUES $1;
        `, [values.join(',')]);
    }

    constructor(private _winner: IWinner) {
        this.properties = { ...this._winner };
    }
}