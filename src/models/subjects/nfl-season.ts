import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';
import { Subject, ISubject } from '../entities/subject';

export interface ISportSeason<TJson> extends ISubject {
    external_id: string;
    topic: number;
    parent_external_id: string;
    created: Date;
    updated: Date;
    deleted: boolean;
    json: TJson;
}

export class NFLSeason extends Subject<ISportSeason<NFLResponse.Season>> {

    async getRelatedSubjects(): Promise<Array<Subject<ISubject>>> {
        return [];
    }
}