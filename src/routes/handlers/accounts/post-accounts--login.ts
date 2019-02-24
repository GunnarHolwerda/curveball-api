import * as Joi from 'joi';
import * as hapi from 'hapi';
import * as Boom from 'boom';
import { AccountFactory } from '../../../models/factories/account-factory';

export const postAcocuntsLoginSchema = Joi.object().keys({
    email: Joi.string().required().description('Email for the account'),
    password: Joi.string().required().description('Password for the account'),
}).unknown(false);

export async function postAccountsLogin(event: hapi.Request): Promise<object> {
    const { email, password } = event.payload as { email: string, password: string };
    const account = await AccountFactory.loadByEmail(email);
    if (account === null) {
        throw Boom.notFound();
    }

    if (!account.isCorrectPassword(password)) {
        throw Boom.forbidden();
    }

    return {
        id: account.properties.id,
        networkName: account.properties.network_name,
        token: account.generateJwt()
    };
}


