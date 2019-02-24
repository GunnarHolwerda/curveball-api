import * as Joi from 'joi';

import * as hapi from 'hapi';
import * as Boom from 'boom';
import { AccountFactory } from '../../../models/factories/account-factory';
import { Account } from '../../../models/entities/account';

const emailRegex = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

export const postAccountSchema = Joi.object().keys({
    email: Joi.string().required().regex(emailRegex).description('Email for the account'),
    password: Joi.string().required().description('Password for the account'),
    networkName: Joi.string().required().description('The name of the network for the account')
}).unknown(false);

export async function postAccount(event: hapi.Request): Promise<object> {
    const { email, password, networkName } = event.payload as { email: string, password: string, networkName: string };
    const [accountFromEmail, accountFromNetworkName] = await Promise.all([
        AccountFactory.loadByEmail(email), AccountFactory.loadByNetworkName(networkName)
    ]);
    if (accountFromEmail !== null || accountFromNetworkName !== null) {
        throw Boom.conflict();
    }

    await Account.create(email, password, networkName);

    return { message: 'ok' };
}


