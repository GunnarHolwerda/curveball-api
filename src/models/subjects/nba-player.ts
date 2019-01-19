import { Subject, ISubject } from '../entities/subject';
import { NBAResponse } from '../../interfaces/sports-api-responses/nba';

export interface INBAPlayer extends ISubject {
    external_id: string;
    topic: number;
    parent_external_id: string;
    created: Date;
    updated: Date;
    deleted: boolean;
    json: NBAResponse.Player;
}

export class NBAPlayer extends Subject<INBAPlayer> {
    constructor(properties: INBAPlayer) {
        super(properties);
    }

    async getRelatedSubjects(): Promise<Subject<ISubject>[]> {
        return [];
    }
}