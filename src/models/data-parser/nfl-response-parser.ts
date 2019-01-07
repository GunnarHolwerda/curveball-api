import { NFLResponse } from '../../interfaces/sports-api-responses/nfl';
import { ResponseParser } from './response-parser';
import * as _ from 'lodash';


export class NFLResponseParser extends ResponseParser<NFLResponse.SeasonSchedule> {
    constructor(response: NFLResponse.SeasonSchedule) {
        super(response);
    }

    public seasonId(): string {
        return this.response.id;
    }

    public getTeams(): Array<NFLResponse.Team> {
        const games = this.getGames();
        const allTeams = _.flatten(games.map(g => [g.away, g.home]));
        return _.uniqBy(allTeams, t => t.id);
    }

    public getGames(): Array<NFLResponse.Game> {
        return _.flatten(this.response.weeks.map(w => w.games));
    }

    public getPlayers(roster: NFLResponse.Roster): Array<NFLResponse.Player> {
        return roster.players;
    }
}