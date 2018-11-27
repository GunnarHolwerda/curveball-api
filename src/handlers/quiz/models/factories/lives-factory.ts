import { Powerup, POWERUP_TABLE_NAME, IPowerup } from '../powerup';
import { Database } from '../database';

export class PowerupFactory {
    public static async loadAvailableForUser(userId: string): Promise<Array<Powerup>> {
        const result = await Database.instance.client.query(`
            SELECT * FROM ${POWERUP_TABLE_NAME} WHERE user_id = $1 AND question IS NULL;
        `, [userId]);
        return result.rows.map(r => new Powerup(r as IPowerup));
    }
}