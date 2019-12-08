import * as Joi from 'joi';
import * as hapi from 'hapi';
import * as Boom from 'boom';
import { AccountFactory } from '../../../models/factories/account-factory';
import { Account } from '../../../models/entities/account';
import { NetworkFactory } from '../../../models/factories/network-factory';
import { Network } from '../../../models/entities/network';

const emailRegex = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

export const postAccountSchema = Joi.object().keys({
    email: Joi.string().required().regex(emailRegex).description('Email for the account'),
    password: Joi.string().required().description('Password for the account'),
    firstName: Joi.string().required().description('First name for the account'),
    lastName: Joi.string().required().description('Last name for the account'),
    network: Joi.object().required().description('The network that should be created for this account').keys({
        name: Joi.string().required().description('Name of the network')
    })
}).unknown(false);

interface CreateAccountPayloadSchema {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    network: {
        name: string;
    };
}

export async function postAccount(event: hapi.Request): Promise<object> {
    const { email, password, firstName, lastName, network } = event.payload as CreateAccountPayloadSchema;
    const [accountFromEmail, networkByName] = await Promise.all([
        AccountFactory.loadByEmail(email), NetworkFactory.loadByName(network.name)
    ]);

    if (networkByName !== null) {
        throw Boom.conflict('Network with that name already exists');
    }

    if (accountFromEmail !== null) {
        throw Boom.conflict('Account with that email already exists');
    }

    const newNetwork = await Network.create(network.name);

    await Account.create({
        email, password, first_name: firstName, last_name: lastName, network_id: newNetwork.properties.id
    });

    return { message: 'ok' };
}


