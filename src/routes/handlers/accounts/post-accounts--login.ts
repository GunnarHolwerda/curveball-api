import * as Joi from '@hapi/joi';
import * as hapi from '@hapi/hapi';
import * as Boom from '@hapi/boom';
import { AccountFactory } from '../../../models/factories/account-factory';
import { NetworkFactory } from '../../../models/factories/network-factory';
import { UserFactory } from '../../../models/factories/user-factory';

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

    const network = await NetworkFactory.load(account.properties.network_id);

    const linkedUserId = await account.linkedUserId();
    const user = linkedUserId ? await UserFactory.load(linkedUserId) : undefined;

    return {
        id: account.properties.id,
        firstName: account.properties.first_name,
        lastName: account.properties.last_name,
        network: {
            id: network!.properties.id,
            name: network!.properties.name
        },
        token: account.generateJwt(),
        linkedUser: user ? {
            user: user.toResponseObject(),
            token: user.getJWTToken()
        } : null
    };
}


