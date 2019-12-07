import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';
import { ResponseParser } from './response-parser';
import * as _ from 'lodash';


export class NFLResponseParser extends ResponseParser<NFLResponse.Season> {
    constructor(response: NFLResponse.Season) {
        super(response);
    }

    public seasonId(): string {
        return `${this.response.season}-${this.response.type}-nfl`;
    }

    public getTeams(hierarchy: NFLResponse.TeamHierarchy): Array<NFLResponse.Teams> {
        const divisions = _.flatten(hierarchy.conferences.map(c => c.divisions));
        const teams = _.flatten(divisions.map(d => d.teams));
        return teams;
    }

    public getGames(): Array<NFLResponse.GamesEntity> {
        return _.flatten(this.response.weeks.map(w => w.games));
    }

    public getPlayers(roster: NFLResponse.Roster): Array<NFLResponse.PlayersEntity> {
        return roster.players;
    }
}