
import * as hapi from 'hapi';
import * as Boom from 'boom';
import { UserFactory } from '../../../models/factories/user-factory';

export async function getUser(event: hapi.Request): Promise<object> {
    const userId = event.params['userId'];
    const user = await UserFactory.load(userId);
    if (user === null) {
        throw Boom.notFound();
    }
    const stats = await user.stats();

    return {
        user: user.toResponseObject(),
        stats
    };
}


