import * as hapi from '@hapi/hapi';
import { IoServer } from '../models/namespaces/io-server';
import { devRoutes } from './helpers/dev-routes';
import { postAccountSchema, postAccount } from './handlers/accounts/post-accounts';
import { postAcocuntsLoginSchema, postAccountsLogin } from './handlers/accounts/post-accounts--login';
import { postAccountLinkSchema, postAccountLink } from './handlers/accounts/post-account--link';

export function accountRoutes(server: hapi.Server, _: IoServer): void {
    const routes: Array<hapi.ServerRoute> = [
        {
            path: '/accounts',
            method: 'post',
            options: {
                auth: false,
                validate: { payload: postAccountSchema },
                description: 'Create an Account',
                notes: 'Creates an account that can own shows and the like'
            },
            handler: postAccount
        },
        {
            path: '/accounts:login',
            method: 'post',
            options: {
                auth: false,
                validate: { payload: postAcocuntsLoginSchema },
                description: 'Log into an account',
                notes: 'Logs a user into their account'
            },
            handler: postAccountsLogin
        },
        {
            path: '/accounts:link',
            method: 'post',
            options: {
                auth: 'accountJwt',
                validate: { payload: postAccountLinkSchema },
                description: 'Links an account to a user account',
                notes: 'Creates a connection between an application account and a web app account'
            },
            handler: postAccountLink
        }
    ];

    devRoutes(routes).forEach(r => server.route(r));
}