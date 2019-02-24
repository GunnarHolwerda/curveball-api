import * as hapi from 'hapi';
import { IoServer } from '../models/namespaces/io-server';
import { devRoutes } from './helpers/dev-routes';
import { postAccountSchema, postAccount } from './handlers/accounts/post-accounts';

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
        }
    ];

    devRoutes(routes).forEach(r => server.route(r));
}