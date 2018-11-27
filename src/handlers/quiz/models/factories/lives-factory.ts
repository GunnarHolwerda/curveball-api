import { Life, LIFE_TABLE_NAME, ILife } from '../lives';
import { Database } from '../database';

export class LivesFactory {
    public static async loadAvailableForUser(userId: string): Promise<Array<Life>> {
        const result = await Database.instance.client.query(`
            SELECT * FROM ${LIFE_TABLE_NAME} WHERE user_id = $1 AND question IS NULL;
        `, [userId]);
        return result.rows.map(r => new Life(r as ILife));
    }
}