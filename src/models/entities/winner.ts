import { Quiz } from './quiz';
import { User } from './user';
import { Database } from '../database';

export interface IWinner {
    userId: string;
    quizId: string;
    amountWon: number;
}

export const WINNER_TABLE_NAME = 'winners';

export class Winner {
    public properties: IWinner;

    static async batchCreate(participants: Array<User>, quiz: Quiz, amountWon: number): Promise<void> {
        for (const p of participants) {
            await Database.instance.client.query(`
                INSERT INTO ${WINNER_TABLE_NAME} (quiz_id, user_id, amount_won) VALUES ($1, $2, $3);
            `, [quiz.properties.quiz_id, p.properties.user_id, amountWon]);
        }
    }

    constructor(private _winner: IWinner) {
        this.properties = { ...this._winner };
    }
}