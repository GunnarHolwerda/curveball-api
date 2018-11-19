import { UserFactory } from '../models/factories/user-factory';

export async function verifyUsername(username: string, userId?: string): Promise<boolean> {
    try {
        const userWithUsername = await UserFactory.loadByUsername(username);
        if (userWithUsername.properties.user_id !== userId) {
            return false;
        }
    } catch (e) { }
    return true;
}