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
        expect(response.user, 'Did not return user object').toBeTruthy();
        expect(response['password'], 'Get endpoint retrieved password').toBeUndefined();
    });

    it('should return the stats object', async () => {
        const response = await userResources.getUser(user.userId);
        expect(response.stats, 'Stats object was not returned').toBeTruthy();
        expect(response.stats.winnings, 'Winnings were not 0 for a user who has no wins').toBe('0');
        expect(response.stats.wins, 'Wins were not 0 for a user who has no wins').toBe(0);
    });

    it('should return 401 if token not provided', async () => {
        const noTokenUserResources = new UserResources();
        await expectHttpError(noTokenUserResources.getUser(user.userId), 401);
    });
});
