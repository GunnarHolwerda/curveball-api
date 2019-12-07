import * as hapi from 'hapi';
import { IoServer } from '../models/namespaces/io-server';
import { devRoutes } from './helpers/dev-routes';
import { postAccountSchema, postAccount } from './handlers/accounts/post-accounts';
import { postAcocuntsLoginSchema, postAccountsLogin } from './handlers/accounts/post-accounts--login';

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
        }
    ];

    devRoutes(routes).forEach(r => server.route(r));
}