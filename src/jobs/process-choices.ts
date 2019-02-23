import { Database } from '../models/database';
import { updateGameData } from './helpers/update-game-data';

Database.instance.connect()
    .then(() => updateGameData())
    .then(() => {
        console.log('success!');
        process.exit(0);
    }).catch((err) => {
        console.error('An error occurred', err);
        process.exit(1);
    });