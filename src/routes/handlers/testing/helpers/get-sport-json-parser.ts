import { NBAResponse } from '../../../../interfaces/sports-api-responses/nba';
import { NFLResponse } from '../../../../interfaces/sports-api-responses/nfl';
import { Sport } from '../../../../models/data-loader/sports-api';
import { NBAResponseParser } from '../../../../models/data-parser/nba-response-parser';
import { NFLResponseParser } from '../../../../models/data-parser/nfl-response-parser';
import { ResponseParser } from '../../../../models/data-parser/response-parser';

export type Schedule = NFLResponse.Season | NBAResponse.SeasonSchedule;

export function getParser(sport: Sport, schedule: Schedule): ResponseParser<any> {
    switch (sport) {
        case Sport.NFL:
            return new NFLResponseParser(schedule as NFLResponse.Season);
        case Sport.NBA:
            return new NBAResponseParser(schedule as NBAResponse.SeasonSchedule);
        default:
            throw new Error('Unsupported sport');
    }
}