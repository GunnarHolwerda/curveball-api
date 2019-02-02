import { NBAResponse } from '../../interfaces/sports-api-responses/nba';
import { SportTeam } from './sport-team';
import { SimpleSubjectResponse } from '../../interfaces/simple-subject-response';

export class NBATeam extends SportTeam<NBAResponse.Team> {
    async asQuestionResponse(): Promise<SimpleSubjectResponse> {
        return {
            subjectId: this.properties.subject_id,
            headline: this.properties.json.name,
            status: 'in-progress',
            description: this.properties.json.alias
        };
    }
}