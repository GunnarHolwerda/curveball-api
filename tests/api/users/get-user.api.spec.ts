import { expectHttpError } from '../../resources/test-helpers';
import { IUserResponse } from '../../../src/models/entities/user';
import { UserResources } from '../../resources/user-resources';

describe('GET /users/{userId}', () => {
    let user: IUserResponse;
    let userResources: UserResources;

    beforeAll(async () => {
        userResources = new UserResources();
        const response = await userResources.getNewUser();
        user = response.user;
        userResources = new UserResources(response.token);
    });

    it('should retrieve user info', async () => {
        const response = await userResources.getUser(user.userId);
        expect(response.user).toBeTruthy('Did not return user object');
        expect(response['password']).toBeUndefined('Get endpoint retrieved password');
    });

    it('should return the stats object', async () => {
        const response = await userResources.getUser(user.userId);
        expect(response.stats).toBeTruthy('Stats object was not returned');
        expect(response.stats.winnings).toBe('0', 'Winnings were not 0 for a user who has no wins');
        expect(response.stats.wins).toBe(0, 'Wins were not 0 for a user who has no wins');
    });

    it('should return 401 if token not provided', async () => {
        const noTokenUserResources = new UserResources();
        await expectHttpError(noTokenUserResources.getUser(user.userId), 401);
    });
});
