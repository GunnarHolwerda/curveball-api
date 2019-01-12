import { Subject, ISubject } from '../entities/subject';
import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';

export interface INFLPlayer extends ISubject {
    id: number;
    topic: number;
    team: string;
    created: Date;
    updated: Date;
    deleted: boolean;
    json: NFLResponse.Player;
}

export class NFLPlayer extends Subject<INFLPlayer> {

    constructor(properties: INFLPlayer) {
        super(properties);
    }
}