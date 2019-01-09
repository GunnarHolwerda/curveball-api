import { Sport, SportsApi } from '../../../models/data-loader/sports-api';
import { NFLSportsApi } from '../../../models/data-loader/nfl-sports-api';
import { NBASportsApi } from '../../../models/data-loader/nba-sports-api';
import * as _ from 'lodash';
import { ResponseParser } from '../../../models/data-parser/response-parser';
import { NFLResponseParser } from '../../../models/data-parser/nfl-response-parser';
import { NFLResponse } from '../../../interfaces/sports-api-responses/nfl';
import { NBAResponse } from '../../../interfaces/sports-api-responses/nba';
import { NBAResponseParser } from '../../../models/data-parser/nba-response-parser';
import { Database } from '../../../models/database';
import { Row } from 'sqorn-pg/types/methods';

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

async function createTeam(teamId: string, sport: Sport, seasonId: string, data: Team): Promise<Array<Row>> {
    const sq = Database.instance.sq;
    const result = await sq.from`choice_reference`.insert({ reference_type: 'sport_team' }).return('reference_id');
    return await sq.from`sport_team`.insert({
        id: teamId,
        reference_id: result[0].reference_id,
        sport: sport,
        season: seasonId,
        json: data
    });
}

async function createPlayer(playerId: string, sport: Sport, teamId: string, data: Player): Promise<Array<Row>> {
    const sq = Database.instance.sq;
    const result = await sq.from`choice_reference`.insert({ reference_type: 'sport_player' }).return('reference_id');
    return await sq.from`sport_player`.insert({
        id: playerId,
        reference_id: result[0].reference_id,
        sport: sport,
        team: teamId,
        json: data
    });
}

async function createGame(gameId: string, sport: Sport, seasonId: string, data: Game): Promise<Array<Row>> {
    const sq = Database.instance.sq;
    const result = await sq.from`choice_reference`.insert({ reference_type: 'sport_game' }).return('reference_id');
    return await sq.from`sport_game`.insert({
        id: gameId,
        sport: sport,
        reference_id: result[0].reference_id,
        season: seasonId,
        json: data
    });
}

export async function preloadGamesTeamsPlayers(sport: Sport): Promise<void> {
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

        await Promise.all(teams.map(t => createTeam(t.id, sport, parser.seasonId(), t)));

        const promises = [
            ...games.map(g => createGame(g.id, sport, parser.seasonId(), g)),
            ..._.flatten(rosters.map(r => {
                const players: Array<Player> = parser.getPlayers(r);
                return players.map(p => createPlayer(p.id, sport, r.id, p));
            }))
        ];
        await Promise.all(promises);
    } catch (e) {
        console.error('Error occurred when uploading', e.message);
        throw e;
    }
}