
import * as hapi from '@hapi/hapi';
import { PowerupFactory } from '../../../models/factories/lives-factory';

export async function getUserLives(event: hapi.Request): Promise<object> {
    const userId = event.params['userId'];

    return {
        lives: (await PowerupFactory.loadAvailableForUser(userId)).length
    };
}


