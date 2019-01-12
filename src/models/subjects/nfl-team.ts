import { Subject, ISubject } from '../entities/subject';
import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';

export interface INFLTeam extends ISubject {
    id: number;
    topic: number;
    season: string;
    created: Date;
    updated: Date;
    deleted: boolean;
    json: NFLResponse.Team;
}

export class NFLTeam extends Subject<INFLTeam> {

    constructor(properties: INFLTeam) {
        super(properties);
    }
}