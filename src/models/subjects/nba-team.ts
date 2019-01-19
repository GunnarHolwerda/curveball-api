import { Subject, ISubject } from '../entities/subject';
import { SubjectTableResponse } from '../../interfaces/subject-table-response';
import { TopicFactory } from '../factories/topic-factory';
import { camelizeKeys } from '../../util/camelize-keys';
import { SubjectFactory } from '../factories/subject-factory';
import { SubjectType } from '../../types/subject-type';
import { NBAResponse } from '../../interfaces/sports-api-responses/nba';

export interface INBATeam extends ISubject {
    external_id: string;
    topic: number;
    season: string;
    created: Date;
    updated: Date;
    deleted: boolean;
    json: NBAResponse.Team;
}

export interface NBATeamResponse extends SubjectTableResponse {
    season: string;
    team: {
        name: string;
        abbreviation: string;
    };
}

export class NBATeam extends Subject<INBATeam> {

    constructor(properties: INBATeam) {
        super(properties);
    }

    async toResponseObject(): Promise<NBATeamResponse> {
        const { external_id, topic: topicId, season, created, updated } = this.properties;
        const topic = await TopicFactory.load(topicId);
        const { name, alias } = this.properties.json;
        return camelizeKeys({
            ... (await super.toResponseObject()),
            external_id, topic, season, created, updated,
            team: {
                name,
                abbreviation: alias
            }
        });
    }

    async getRelatedSubjects(): Promise<Subject<ISubject>[]> {
        return SubjectFactory.loadAllExternallyRelatedSubjects(
            this.properties.external_id, SubjectType.sportPlayer
        );
    }
}