import { expectHttpError } from '../../resources/test-helpers';
import uuid = require('uuid');
import { IUserResponse } from '../../../src/models/entities/user';
import { UserResources } from '../../resources/user-resources';

describe('PUT /users/{userId}', () => {
    let user: IUserResponse;
    let userResources: UserResources;

    beforeAll(async () => {
        userResources = new UserResources();
        const response = await userResources.getNewUser();
        user = response.user;
        userResources = new UserResources(response.token);
    });

    it('should update user properties properly', async () => {
        const newName = 'newName';
        const response = await userResources.updateUser(user.userId!, {
            name: newName
        });
        expect(response.user.name).toBe(newName);
        expect(response.user.photo).not.toBe('');
    });

    it('should return 401 if no token is provided', async () => {
        const myResources = new UserResources();
        await expectHttpError(myResources.updateUser(user.userId!, { name: '' }), 401);
    });

    it('should return 403 if changing user that is not user in token', async () => {
        const { user: otherUser } = await userResources.getNewUser();
        await expectHttpError(userResources.updateUser(otherUser.userId!, { name: uuid() }), 403);
    });

    it('should return 409 if tring to update to a used username', async () => {
        const { user: otherUser } = await userResources.getNewUser();
        await expectHttpError(userResources.updateUser(user.userId, { username: otherUser.username }), 409);
    });

    it('should return 400 if not all required parameters provided', async () => {
        // @ts-ignore
        await expectHttpError(userResources.updateUser(user.userId!, { name: '' }), 400);
    });
});
