
import * as hapi from 'hapi';
import * as Joi from 'joi';
import { FriendRecommender } from '../../../../models/friend-recommender';
import { UserJwtClaims } from '../../../../interfaces/user-jwt-claims';
import { UserFactory } from '../../../../models/factories/user-factory';

export const postUserFriendsRecommendedSchema = Joi.object({
    phones: Joi.array().items(Joi.string()).description('Phone numbers to check if user account exists')
});

export async function postUserFriendsRecommended(event: hapi.Request): Promise<object> {
    const { phones } = event.payload as { phones: Array<string> };
    const { userId } = event.auth.credentials as UserJwtClaims;
    const user = await UserFactory.load(userId);

    console.log('Recommending friends for', phones);

    const recommender = new FriendRecommender(user!);
    const friendRecommendations = await recommender.getRecommendedFriends(phones);
    return {
        recommendations: friendRecommendations.map(f => f.toResponseObject([]))
    };
}


