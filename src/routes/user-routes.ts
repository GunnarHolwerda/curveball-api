import * as hapi from '@hapi/hapi';

import { IoServer } from '../models/namespaces/io-server';
import { postUserSchema, postUser } from './handlers/users/post-user';
import { getUser } from './handlers/users/get-user';
import { onlyCurrentUser } from './pres/only-current-user';
import { putUserSchema, putUser } from './handlers/users/put-user';
import { getUserLives } from './handlers/users/get-user-lives';
import { postUserVerifySchema, postUserVerify } from './handlers/users/post-user--verify';
import { extractQtClaims } from './pres/extract-quiz-claims';
import { useLife } from './handlers/users/post-users-lives--use';
import { postUserFriends } from './handlers/users/friends/post-user-friends';
import { postUserFriendsInvite } from './handlers/users/friends/post-user-friends--invite';
import { getUserFriends } from './handlers/users/friends/get-user-friends';
import { deleteUserFriend } from './handlers/users/friends/delete-user-friend';
import { postUserFriendsRecommended } from './handlers/users/friends/post-user-friends--recommended';
import { devRoutes } from './helpers/dev-routes';
import { getUserPicks } from './handlers/users/picks/get-user-picks';

export function userRoutes(server: hapi.Server, _: IoServer): void {
    const routes: Array<hapi.ServerRoute> = [
        {
            path: '/users',
            method: 'post',
            options: {
                auth: false,
                validate: { payload: postUserSchema },
                description: 'Create a user',
                notes: 'Creates a user using a phone number'
            },
            handler: postUser
        },
        {
            path: '/users/{userId}',
            method: 'get',
            options: {
                description: 'Retrieve user details',
                notes: 'Retrieves user details and stats information for the specified user'
            },
            handler: getUser
        },
        {
            path: '/users/{userId}',
            method: 'put',
            options: {
                pre: [onlyCurrentUser],
                validate: { payload: putUserSchema },
                description: 'Update user information',
                notes: 'Updates certain user properties'
            },
            handler: putUser
        },
        {
            path: '/users/{userId}/lives',
            method: 'get',
            options: {
                pre: [onlyCurrentUser],
                description: '(WILL CHANGE) Retrieve the number of powerups for a user',
                notes: 'Calculates the nubmer powerups for a user and returns them'
            },
            handler: getUserLives
        },
        {
            path: '/users/{userId}/verify',
            method: 'post',
            options: {
                auth: false,
                validate: { payload: postUserVerifySchema },
                description: 'Validate a user phone number',
                notes: 'Gives user access to their user with a jwt token and provides the ability to set the username and name'
            },
            handler: postUserVerify
        },
        {
            path: '/users/{userId}/picks',
            method: 'get',
            options: {
                description: 'Retrieve picks for a user',
                notes: 'Retrieves picks by show for the user specified'
            },
            handler: getUserPicks
        },
        {
            path: '/users/{userId}/lives/use',
            method: 'post',
            options: {
                pre: [extractQtClaims, onlyCurrentUser],
                description: 'Use a powerup',
                notes: 'Use a powerup for a user'
            },
            handler: useLife
        },
        {
            path: '/users/{userId}/friends/{friendUserId}',
            method: 'post',
            options: {
                pre: [onlyCurrentUser],
                description: 'Add a friend',
                notes: 'Adds a friend record for the current user'
            },
            handler: postUserFriends
        },
        {
            path: '/users/{userId}/friends:invite',
            method: 'post',
            options: {
                pre: [onlyCurrentUser],
                description: 'Invite a new user using their phone number',
                notes: 'Creates an invitation record for a phone number to determine users who brought in other ' +
                    'users. When an invited user registers, they will automatically be added as friends'
            },
            handler: postUserFriendsInvite
        },
        {
            path: '/users/{userId}/friends',
            method: 'get',
            options: {
                pre: [onlyCurrentUser],
                description: 'Retrieve a users friends',
                notes: 'Retrieves all of the friends for a particular user'
            },
            handler: getUserFriends
        },
        {
            path: '/users/{userId}/friends:recommended',
            method: 'post',
            options: {
                pre: [onlyCurrentUser],
                description: 'Request list of user\'s recommended friends',
                notes: 'Supply a set of phone numbers to see if user accounts exist' +
                    ' for those numbers and will return the recommended friends'
            },
            handler: postUserFriendsRecommended
        },
        {
            path: '/users/{userId}/friends/{friendUserId}',
            method: 'delete',
            options: {
                pre: [onlyCurrentUser],
                description: 'Removes a friend',
                notes: 'Removes a user as a friend from the current user'
            },
            handler: deleteUserFriend
        }
    ];

    devRoutes(routes).forEach(r => server.route(r));
}