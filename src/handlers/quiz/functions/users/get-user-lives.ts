
import * as hapi from 'hapi';
import { LivesFactory } from '../../models/factories/lives-factory';

export async function getUserLives(event: hapi.Request): Promise<object> {
    const userId = event.params['userId'];

    return {
        lives: (await LivesFactory.loadAvailableForUser(userId)).length
    };
}


