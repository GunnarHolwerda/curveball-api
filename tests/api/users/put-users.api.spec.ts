import { expectHttpError } from '../resources/test-helpers';
import { Test } from '../resources/user-resources';
import { IUserResponse } from '../../../src/handlers/quiz/models/user';
import uuid = require('uuid');

describe('PUT /users/{userId}', () => {
    let user: IUserResponse;
    let userResources: Test.UserResources;

    beforeAll(async () => {
        userResources = new Test.UserResources();
        const response = await userResources.getNewUser();
        user = response.user;
        userResources = new Test.UserResources(response.token);
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
        const myResources = new Test.UserResources();
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
