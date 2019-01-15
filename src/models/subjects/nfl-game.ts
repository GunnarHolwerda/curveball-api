import { Subject, ISubject } from '../entities/subject';
import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';
import { camelizeKeys } from '../../util/camelize-keys';
import { SubjectFactory } from '../factories/subject-factory';
import { SubjectType } from '../../types/subject-type';
import { SubjectTableResponse } from '../../interfaces/subject-table-response';
import { NFLTeamResponse, NFLTeam } from './nfl-team';
import { Choice } from '../entities/question-choice';
import { NFLPlayer } from './nfl-player';

export interface INFLGame extends ISubject {
    external_id: string;
    topic: number;
    parent_external_id: string;
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

    get homeTeam(): Promise<NFLTeam> {
        const { home } = this.properties.json;
        return SubjectFactory.loadByExternalId(home.id, SubjectType.sportTeam)
            .then(t => t! as NFLTeam);
    }

    get awayTeam(): Promise<NFLTeam> {
        const { away } = this.properties.json;
        return SubjectFactory.loadByExternalId(away.id, SubjectType.sportTeam)
            .then(t => t! as NFLTeam);
    }

    get players(): Promise<Array<NFLPlayer>> {
        return (async () => {
            const teams = await Promise.all([this.homeTeam, this.awayTeam]);
            const [homeTeamPlayers, awayTeamPlayers] = await Promise.all(
                teams.map(t => t.getRelatedSubjects().then(s => s as Array<NFLPlayer>))
            );
            return [...homeTeamPlayers, ...awayTeamPlayers];
        })();
    }

    async toResponseObject(): Promise<INFLGameResponse> {
        const { external_id, topic, parent_external_id, created, updated } = this.properties;
        // TODO: Add index to external id on subject tables
        const { home, away } = this.properties.json;
        const [homeTeam, awayTeam] = await Promise.all([
            SubjectFactory.loadByExternalId(home.id, SubjectType.sportTeam),
            SubjectFactory.loadByExternalId(away.id, SubjectType.sportTeam)
        ]);
        return camelizeKeys({
            ... (await super.toResponseObject()),
            external_id, topic, created, updated,
            seasonExternalId: parent_external_id,
            game: {
                home: await homeTeam!.toResponseObject(),
                away: await awayTeam!.toResponseObject(),
                date: this.properties.json.scheduled,
                status: this.properties.json.status
            }
        });
    }

    async getRelatedChoices(): Promise<Array<Choice>> {
        throw new Error('Method not implemented.');
    }

    async getRelatedSubjects(): Promise<Array<Subject<ISubject>>> {
        const teams = await Promise.all([this.homeTeam, this.awayTeam]);
        const players = await this.players;
        return [
            ...teams,
            ...players
        ];
    }
}