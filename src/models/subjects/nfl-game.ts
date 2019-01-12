import { Subject, ISubject } from '../entities/subject';
import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';

export interface INFLGame extends ISubject {
    id: number;
    topic: number;
    season: string;
    created: Date;
    updated: Date;
    deleted: boolean;
    json: NFLResponse.Game;
}

export class NFLGame extends Subject<INFLGame> {

    constructor(properties: INFLGame) {
        super(properties);
    }
}