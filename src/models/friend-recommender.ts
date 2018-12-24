import { User, USER_TABLE_NAME, IUser } from './entities/user';
import { PhoneVerifier } from './phone-verifier';
import { Database } from './database';
import { FRIEND_TABLE_NAME } from './entities/friend';

export class FriendRecommender {
    constructor(private user: User) { }

    public async getRecommendedFriends(phones: Array<string>): Promise<Array<User>> {
        const formattedPhoneNumbers = phones
            .map(p => PhoneVerifier.getValidPhoneNumber(p))
            .filter(p => p !== null) as Array<string>;
        console.log(formattedPhoneNumbers);
        const sq = Database.instance.sq;
        const query = sq.from({ 'u': USER_TABLE_NAME })
            .left.join({ 'f': FRIEND_TABLE_NAME }).on`u.user_id = f.account_user_id`
            .and`f.friend_user_id != ${this.user.properties.user_id}`
            .where({ 'u.phone': formattedPhoneNumbers })
            .and`f.account_user_id IS NULL`;
        console.log(query.query);
        const result = await query;

        console.log('Recommendation results', result);

        return result.map(r => new User(r as IUser));
    }
}