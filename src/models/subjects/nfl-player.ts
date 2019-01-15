import { Subject, ISubject } from '../entities/subject';
import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';
import { Choice } from '../entities/question-choice';

export interface INFLPlayer extends ISubject {
    external_id: string;
    topic: number;
    parent_external_id: string;
    created: Date;
    updated: Date;
    deleted: boolean;
    json: NFLResponse.Player;
}

export class NFLPlayer extends Subject<INFLPlayer> {
    constructor(properties: INFLPlayer) {
        super(properties);
    }

    async getRelatedChoices(): Promise<Array<Choice>> {
        throw new Error('Method not implemented.');
    }

    async getRelatedSubjects(): Promise<Subject<ISubject>[]> {
        return [];
    }
}