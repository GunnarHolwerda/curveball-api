import { SpreadScorer } from '../../../src/models/scorers/spread-scorer';
import { when, anything, spy } from 'ts-mockito';
import { SubjectFactory } from '../../../src/models/factories/subject-factory';
import { Choice } from '../../../src/models/entities/question-choice';
import * as uuid from 'uuid';
import { NFLGame } from '../../../src/models/subjects/nfl-game';

describe('SpreadScorer', () => {
    let scorer: SpreadScorer;
    let homeTeamId: string;
    let awayTeamId: string;

    const getDummyGame = (homeId: string, homePoints: number, awayId: string, awayPoints: number): NFLGame => {
        return {
            getHomeTeam: () => ({ id: homeId, points: homePoints }),
            getAwayTeam: () => ({ id: awayId, points: awayPoints }),
            isFinished: () => false,
            updateStatistics: () => Promise.resolve()
        } as NFLGame;
    };

    const createMockChoice = (selection: string, teamId: string): Choice => {
        const spiedSubjectFactory = spy(SubjectFactory);
        when(spiedSubjectFactory.load(anything(), anything())).thenReturn(Promise.resolve({ properties: { external_id: teamId } } as any));
        return {
            properties: {
                text: selection,
                external_id: teamId
            }
        } as any;
    };

    beforeEach(() => {
        homeTeamId = uuid();
        awayTeamId = uuid();
        scorer = new SpreadScorer(null as any);
    });

    it('should return positive score for picking favored team and they cover', async () => {
        const game = getDummyGame(homeTeamId, 10, awayTeamId, 8);
        expect(await scorer.calculateScoreForSubject(game, createMockChoice('-1', homeTeamId))).toBeGreaterThan(0);
    });

    it('should return positive score for picking underdog team and favored team does not cover', async () => {
        const game = getDummyGame(homeTeamId, 10, awayTeamId, 8);
        expect(await scorer.calculateScoreForSubject(game, createMockChoice('+3', awayTeamId))).toBeGreaterThan(0);
    });

    it('should return 0 score for picking favored team and they do not cover', async () => {
        const game = getDummyGame(homeTeamId, 10, awayTeamId, 8);
        expect(await scorer.calculateScoreForSubject(game, createMockChoice('-4', homeTeamId))).toBe(0);
    });

    it('should return 0 score for picking underdog team and favored team covers', async () => {
        const game = getDummyGame(homeTeamId, 10, awayTeamId, 8);
        expect(await scorer.calculateScoreForSubject(game, createMockChoice('+1', awayTeamId))).toBe(0);
    });

    it('should return 0 if the game results in a push', async () => {
        const game = getDummyGame(homeTeamId, 10, awayTeamId, 8);
        expect(await scorer.calculateScoreForSubject(game, createMockChoice('+2', homeTeamId))).toBe(0, 'Underdog got points');
        expect(await scorer.calculateScoreForSubject(game, createMockChoice('-2', awayTeamId))).toBe(0, 'Favorite got points');
    });
});