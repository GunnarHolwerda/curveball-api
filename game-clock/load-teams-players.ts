import { Sport, SportsApi } from '../src/models/data-loader/sports-api';
import { NFLSportsApi } from '../src/models/data-loader/nfl-sports-api';
import { NBASportsApi } from '../src/models/data-loader/nba-sports-api';
import * as _ from 'lodash';
import { ResponseParser } from '../src/models/data-parser/response-parser';
import { NFLResponseParser } from '../src/models/data-parser/nfl-response-parser';
import { NFLResponse } from '../src/interfaces/sports-api-responses/nfl';
import { NBAResponse } from '../src/interfaces/sports-api-responses/nba';
import { NBAResponseParser } from '../src/models/data-parser/nba-response-parser';
import { Database } from '../src/models/database';

function getApi(sport: Sport): SportsApi {
    switch (sport) {
        case Sport.NFL:
            return new NFLSportsApi();
        case Sport.NBA:
            return new NBASportsApi();
        default:
            throw new Error('Unsupported sport');
    }
}

type Schedule = NFLResponse.SeasonSchedule | NBAResponse.SeasonSchedule;
type Team = NFLResponse.Team | NBAResponse.Team;
type Game = NFLResponse.Game | NBAResponse.Game;
type Roster = NFLResponse.Roster | NBAResponse.Roster;
type Player = NFLResponse.Player | NBAResponse.PlayerDetail;

function getParser(sport: Sport, schedule: Schedule): ResponseParser<any> {
    switch (sport) {
        case Sport.NFL:
            return new NFLResponseParser(schedule as NFLResponse.SeasonSchedule);
        case Sport.NBA:
            return new NBAResponseParser(schedule as NBAResponse.SeasonSchedule);
        default:
            throw new Error('Unsupported sport');
    }
}

async function preloadGamesTeamsPlayers(sport: Sport): Promise<void> {
    const api = getApi(sport);
    console.log('Requesting schedule');
    const schedule = await api.getSeasonSchedule<Schedule>();

    const parser = getParser(sport, schedule);
    console.log('Parsing teams');
    const teams: Array<Team> = parser.getTeams();
    console.log('Parsing games');
    const games: Array<Game> = parser.getGames();

    const rosters: Array<Roster> = [];
    for (const team of teams) {
        console.log('Requesting ', team.name);
        rosters.push(await api.getTeamRoster<Roster>(team.id));
    }

    console.log('Inserting into database');
    await Database.instance.connect();
    const sq = Database.instance.sq;

    try {
        await sq.from`sport_season`.insert({
            id: parser.seasonId(),
            sport: sport,
            json: schedule
        });

        await Promise.all(teams.map(t => sq.from`sport_team`.insert({
            id: t.id,
            sport: sport,
            season: parser.seasonId(),
            json: t
        })));

        const promises = [
            ...games.map(g => sq.from`sport_game`.insert({
                id: g.id,
                sport: sport,
                season: parser.seasonId(),
                json: g
            })),
            ..._.flatten(rosters.map(r => {
                const players: Array<Player> = parser.getPlayers(r);
                return players.map(p => sq.from`sport_player`.insert({
                    id: p.id,
                    sport: sport,
                    team: r.id,
                    json: p
                }));
            }))
        ];
        await Promise.all(promises);
    } catch (e) {
        console.error('Error occurred when uploading', e.message);
        throw e;
    }
}

preloadGamesTeamsPlayers(Sport.NFL).then(() => {
    console.log('Successfully uploaded full season');
    process.exit(0);
}).catch((err) => {
    console.error('An error occurred', err.message);
    process.exit(1);
});