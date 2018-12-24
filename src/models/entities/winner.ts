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
        const sq = Database.instance.sq;
        const inserts = participants.map(p => {
            return { quiz_id: quiz.properties.quiz_id, user_id: p.properties.user_id, amount_won: amountWon };
        });
        await sq.from(WINNER_TABLE_NAME).insert(inserts);
    }

    constructor(private _winner: IWinner) {
        this.properties = { ...this._winner };
    }
}