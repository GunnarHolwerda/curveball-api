import { NflSpreadScorer } from '../../../src/models/scorers/nfl-spread-scorer';
import { when, anything, spy } from 'ts-mockito';
import { SubjectFactory } from '../../../src/models/factories/subject-factory';
import { NFLGame } from '../../../src/models/subjects/nfl-game';
import { Choice } from '../../../src/models/entities/question-choice';

describe('NFLSpreadScorer', () => {
    let scorer: NflSpreadScorer;

    const getDummyGame = (homeId: number, homePoints: number, awayId: number, awayPoints: number): NFLGame => {
        return {
            properties: {
                statistics: {
                    summary: {
                        home: { id: homeId, points: homePoints },
                        away: { id: awayId, points: awayPoints }
                    }
                }
            }
        } as any;
    };

    const createMockChoice = (selection: string, teamId: number): Choice => {
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
        scorer = new NflSpreadScorer(null as any);
    });

    it('should return positive score for picking favored team and they cover', async () => {
        const game = getDummyGame(4, 10, 5, 8);
        expect(await scorer.calculateScoreForSubject(game, createMockChoice('-1', 4))).toBeGreaterThan(0);
    });

    it('should return positive score for picking underdog team and favored team does not cover', async () => {
        const game = getDummyGame(4, 10, 5, 8);
        expect(await scorer.calculateScoreForSubject(game, createMockChoice('+3', 5))).toBeGreaterThan(0);
    });

    it('should return 0 score for picking favored team and they do not cover', async () => {
        const game = getDummyGame(4, 10, 5, 8);
        expect(await scorer.calculateScoreForSubject(game, createMockChoice('-4', 4))).toBe(0);
    });

    it('should return 0 score for picking underdog team and favored team covers', async () => {
        const game = getDummyGame(4, 10, 5, 8);
        expect(await scorer.calculateScoreForSubject(game, createMockChoice('+1', 5))).toBe(0);
    });

    it('should return 0 if the game results in a push', async () => {
        const game = getDummyGame(4, 10, 5, 8);
        expect(await scorer.calculateScoreForSubject(game, createMockChoice('+2', 5))).toBe(0);
        expect(await scorer.calculateScoreForSubject(game, createMockChoice('-2', 4))).toBe(0);
    });
});