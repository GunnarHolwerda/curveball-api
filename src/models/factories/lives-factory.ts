import { Powerup, POWERUP_TABLE_NAME, IPowerup } from '../entities/powerup';
import { Database } from '../database';

export class PowerupFactory {
    public static async loadAvailableForUser(userId: string): Promise<Array<Powerup>> {
        const sq = Database.instance.sq;
        const result = await sq.from(POWERUP_TABLE_NAME).where`user_id = ${userId}`.and`question IS NULL`;
        return result.map(r => new Powerup(r as IPowerup));
    }
}