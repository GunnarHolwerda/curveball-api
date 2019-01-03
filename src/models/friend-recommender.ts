import { User, IUser, USER_TABLE_NAME } from './entities/user';
import { PhoneVerifier } from './phone-verifier';
import { Database } from './database';
import { FRIEND_TABLE_NAME } from './entities/friend';

export class FriendRecommender {
    constructor(_user: User) {
    }

    public async getRecommendedFriends(phones: Array<string>): Promise<Array<User>> {
        const formattedPhoneNumbers = phones
            .map(p => PhoneVerifier.getValidPhoneNumber(p))
            .filter(p => p !== null) as Array<string>;

        // TODO: Replace with sqorn once we upgrade to 0.0.45
        const result = await Database.instance.pool.query(`select u.* from ${USER_TABLE_NAME} as u
        left join ${FRIEND_TABLE_NAME} as f on (u.user_id = f.friend_user_id)
        where (u.phone IN (${formattedPhoneNumbers.map(p => `'${p}'`).join(',')}))
        and (f.account_user_id IS NULL);`);

        return result.rows.map(r => new User(r as IUser));
    }
}