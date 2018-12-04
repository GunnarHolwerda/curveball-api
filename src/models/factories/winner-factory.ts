import { Winner, WINNER_TABLE_NAME, IWinner } from '../entities/winner';
import { Database } from '../database';

export class WinnerFactory {
    public static async loadAllForUser(userId: string): Promise<Array<Winner>> {
        const sq = Database.instance.sq;
        const result = await sq.from(WINNER_TABLE_NAME).where`user_id = ${userId}`;

        return result.map(r => new Winner(r as IWinner));
    }
}