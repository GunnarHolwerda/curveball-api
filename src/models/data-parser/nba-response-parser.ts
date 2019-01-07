import { NBAResponse } from '../../interfaces/sports-api-responses/nba';
import { ResponseParser } from './response-parser';
import * as _ from 'lodash';


export class NBAResponseParser extends ResponseParser<NBAResponse.SeasonSchedule> {
    constructor(response: NBAResponse.SeasonSchedule) {
        super(response);
    }

    public seasonId(): string {
        return this.response.season.id;
    }

    public getTeams(): Array<NBAResponse.Team> {
        const games = this.getGames();
        const allTeams = _.flatten(games.map(g => [g.away, g.home]));
        return _.uniqBy(allTeams, t => t.id);
    }

    public getGames(): Array<NBAResponse.Game> {
        return this.response.games;
    }

    public getPlayers(roster: NBAResponse.Roster): Array<NBAResponse.PlayerDetail> {
        return roster.players;
    }
}