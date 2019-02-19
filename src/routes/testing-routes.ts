import * as hapi from 'hapi';
import { IoServer } from '../models/namespaces/io-server';
import { onlyLocalPreHandler } from './pres/only-local';
import * as Joi from 'joi';
import { generateRandomAnswers } from './handlers/testing/generate-random-answers';
import { Sport } from '../models/data-loader/sports-api';
import { preloadGamesTeamsPlayers } from './handlers/testing/load-teams-players';

export function testingRoutes(server: hapi.Server, _: IoServer): void {
    server.route({
        path: '/test/answers:generate',
        method: 'POST',
        options: {
            auth: false,
            tags: ['api', 'test'],
            description: 'Creates a bunch of dummy answers for a quiz question',
            notes: 'Generates a bunch of dummy users to create answers for a question on a quiz',
            pre: [onlyLocalPreHandler],
            validate: {
                payload: {
                    questionId: Joi.string().description('The question to generate answer for'),
                    numAnswers: Joi.number().default(100).description('The number of answers to create')
                }
            }
        },
        handler: generateRandomAnswers
    });

    server.route({
        path: '/test/sport:load',
        method: 'POST',
        options: {
            auth: false,
            tags: ['api', 'test'],
            description: 'Preloads a sports season, games, teams, and players',
            notes: 'Used to populate local development DB with sports data for testing questions and associations',
            pre: [onlyLocalPreHandler],
            validate: {
                payload: {
                    // TODO: Validate that this is a valid sport
                    sport: Joi.string().description('The sport to preload'),
                    year: Joi.number().optional().description('The year of the season you want to load'),
                    // TODO: Validate a valid season type
                    seasonType: Joi.string().optional().default('REG').description('The type of schedule to load data for')
                }
            }
        },
        handler: async (event) => {
            const { sport, year, seasonType } = event.payload as { sport: Sport, year?: number, seasonType: string };
            const seasonYear = year === undefined ? new Date().getFullYear() : year;
            await preloadGamesTeamsPlayers(sport, seasonYear, seasonType);
            return {
                message: `${sport} teams from ${seasonYear} have been preloaded`
            };
        }
    });
}