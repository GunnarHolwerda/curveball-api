import { SpreadScorer } from '../../../src/models/scorers/spread-scorer';
import { when, anything, spy } from 'ts-mockito';
import { SubjectFactory } from '../../../src/models/factories/subject-factory';
import { Choice } from '../../../src/models/entities/question-choice';
import * as uuid from 'uuid';
import { NFLGame } from '../../../src/models/subjects/nfl-game';
import { Question } from '../../../src/models/entities/question';
import { NFLTeam } from '../../../src/models/subjects/nfl-team';

xdescribe('SpreadScorer', () => {
    let scorer: SpreadScorer;
    let homeTeamId: string;
    let awayTeamId: string;
    let game: NFLGame;

    const getDummyGame = (homeId: string, homePoints: number, awayId: string, awayPoints: number): NFLGame => {
        return {
            getHomeTeam: () => ({ id: homeId, points: homePoints }),
            getAwayTeam: () => ({ id: awayId, points: awayPoints }),
            isFinished: () => false,
            updateStatistics: () => Promise.resolve()
        } as NFLGame;
    };

    const createMockChoice = (selection: string, teamId: string): Choice<{ spread: string }> => {
        const spiedSubjectFactory = spy(SubjectFactory);
        when(spiedSubjectFactory.load(anything(), anything())).thenReturn(Promise.resolve({ properties: { external_id: teamId } } as any));
        return {
            properties: {
                text: selection,
                external_id: teamId
            },
            data: {
                spread: ''
            }
        } as any;
    };

    const createMockTeam = (id: string): NFLTeam => {
        return {
            properties: {
                external_id: id
            }
        } as NFLTeam;
    };

    beforeEach(() => {
        homeTeamId = uuid();
        awayTeamId = uuid();
        game = getDummyGame(homeTeamId, 10, awayTeamId, 8);
        scorer = new SpreadScorer({ subject: () => Promise.resolve(game) } as Question);
    });

    it('should return positive score for picking favored team and they cover', async () => {
        expect(await scorer.calculateScoreForSubject(createMockTeam(homeTeamId), createMockChoice('-1', homeTeamId))).toBeGreaterThan(0);
    });

    it('should return positive score for picking underdog team and favored team does not cover', async () => {
        expect(await scorer.calculateScoreForSubject(createMockTeam(awayTeamId), createMockChoice('+3', awayTeamId))).toBeGreaterThan(0);
    });

    it('should return 0 score for picking favored team and they do not cover', async () => {
        expect(await scorer.calculateScoreForSubject(createMockTeam(homeTeamId), createMockChoice('-4', homeTeamId))).toBe(0);
    });

    it('should return 0 score for picking underdog team and favored team covers', async () => {
        expect(await scorer.calculateScoreForSubject(createMockTeam(awayTeamId), createMockChoice('+1', awayTeamId))).toBe(0);
    });

    it('should return 0 if the game results in a push', async () => {
        expect(await scorer.calculateScoreForSubject(
            createMockTeam(homeTeamId), createMockChoice('+2', homeTeamId)
        )).toBe(0, 'Underdog got points');
        expect(await scorer.calculateScoreForSubject(
            createMockTeam(awayTeamId), createMockChoice('-2', awayTeamId)
        )).toBe(0, 'Favorite got points');
    });
});