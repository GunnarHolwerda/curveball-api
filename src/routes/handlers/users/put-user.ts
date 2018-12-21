import * as Joi from 'joi';
import * as Boom from 'boom';

import * as hapi from 'hapi';
import { IUser } from '../../../models/entities/user';
import { UserFactory } from '../../../models/factories/user-factory';

export const putUserSchema = Joi.object().keys({
    name: Joi.string().optional(),
    // TODO: Prevent whitespace
    username: Joi.string().min(1).max(15).optional(),
    // referral: Joi.string().optional(),
    photo: Joi.string().uri().optional()
});

export async function putUser(event: hapi.Request): Promise<object> {
    const userId = event.params['userId'];
    const userParams = event.payload as IUser;
    const user = await UserFactory.load(userId);

    if (user === null) {
        throw Boom.notFound();
    }

    // TODO: Set this up, keep track of who referred who
    // if (referral) {
    //     try {
    //         const referrer = await UserFactory.loadByUsername(referral);
    //         if (referrer === null) {
    //             throw Boom.badRequest('Invalid referral code');
    //         }
    //         await Powerup.create(referrer.properties.user_id);
    //     } catch (e) {
    //         throw Boom.badRequest('Invalid referral code');
    //     }
    // }

    for (const property in userParams) {
        if (userParams.hasOwnProperty(property)) {
            user.properties[property] = userParams[property];
        }
    }

    try {
        await user.save();
    } catch (e) {
        if (e.code === '23505') {
            throw Boom.conflict();
        }
        throw Boom.badRequest();
    }

    return {
        user: user.toResponseObject()
    };
}


