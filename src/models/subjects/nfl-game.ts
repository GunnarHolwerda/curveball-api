import { Subject, ISubject } from '../entities/subject';
import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';
import { camelizeKeys } from '../../util/camelize-keys';
import { SubjectFactory } from '../factories/subject-factory';
import { SubjectType } from '../../types/subject-type';
import { SubjectTableResponse } from '../../interfaces/subject-table-response';
import { NFLTeamResponse } from './nfl-team';

export interface INFLGame extends ISubject {
    id: number;
    topic: number;
    season: string;
    created: Date;
    updated: Date;
    deleted: boolean;
    json: NFLResponse.Game;
}

export interface NFLGameResponse {
    home: NFLTeamResponse;
    away: NFLTeamResponse;
    date: string;
}

export interface INFLGameResponse extends SubjectTableResponse {
    game: NFLGameResponse;
}

export class NFLGame extends Subject<INFLGame> {

    constructor(properties: INFLGame) {
        super(properties);
    }

    async toResponseObject(): Promise<INFLGameResponse> {
        const { id, topic, season, created, updated } = this.properties;
        // TODO: Add index to external id on subject tables
        const { home, away } = this.properties.json;
        const [homeTeam, awayTeam] = await Promise.all([
            SubjectFactory.loadByExternalId(home.id, SubjectType.sportTeam),
            SubjectFactory.loadByExternalId(away.id, SubjectType.sportTeam)
        ]);
        return camelizeKeys({
            id, topic, season, created, updated,
            game: {
                home: await homeTeam!.toResponseObject(),
                away: await awayTeam!.toResponseObject(),
                date: this.properties.json.scheduled,
            }
        });
    }
}