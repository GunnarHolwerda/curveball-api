import * as uuid from 'uuid';
import { mockManualQuestionsPayload } from '../mock-data';
import { QuizResources, QuizStartResponse } from '../../resources/quiz-resources';
import { UserResources } from '../../resources/user-resources';
import { expectHttpError } from '../../resources/test-helpers';
import { QuestionsPayload } from '../../../src/routes/handlers/quizzes/questions/post-questions';
import { IChoiceResponse } from '../../../src/models/entities/question-choice';
import { runFullQuiz } from '../helpers/run-full-quiz';


describe('GET /quizzes/{quizId}/questions/{questionId}:results', () => {
    const TotalAnswers = 15;
    let quizResources: QuizResources;
    let startedQuiz: QuizStartResponse;

    beforeAll(async () => {
        quizResources = new QuizResources();
        const result = await runFullQuiz({ numberOfAnswers: TotalAnswers, questions: mockManualQuestionsPayload });
        startedQuiz = result.quizStart;
    });

    it('should retrieve correct stats for answer results for a question', async () => {
        const { quiz, firstQuestion } = startedQuiz;
        const results = await quizResources.getQuestionResults(quiz.quizId, firstQuestion.questionId);
        expect(results.totalAnswers).toBe(TotalAnswers);
    });

    it('should return the number of answers for each question', async () => {
        const { quiz, firstQuestion } = startedQuiz;
        const { results } = await quizResources.getQuestionResults(quiz.quizId, firstQuestion.questionId);
        let numberOfChoicesReturned = 0;
        for (const choiceId in results) {
            if (results.hasOwnProperty(choiceId)) {
                expect(results[choiceId], 'The question results did not return a valid number of selections').toBeGreaterThanOrEqual(0);
                numberOfChoicesReturned++;
            }
        }
        expect(numberOfChoicesReturned, 'Not all choices were returned in results').toBe(firstQuestion.choices.length);
    });

    it('should return the correctAnswer for the question', async () => {
        const { quiz, firstQuestion } = startedQuiz;
        const results = await quizResources.getQuestionResults(quiz.quizId, firstQuestion.questionId);
        const correctAnswerText = mockManualQuestionsPayload.questions[0].choices.find(c => c.isAnswer!)!.text!;
        expect(results.correctAnswer).toBe(firstQuestion.choices.find(c => c.text === correctAnswerText)!.choiceId);
    });

    it('should return 404 question does not belong to quiz', async () => {
        const { firstQuestion } = startedQuiz;
        await expectHttpError(quizResources.getQuestionResults('wonder', firstQuestion.questionId), 404);
    });

    it('should return 404 if question does not exist', async () => {
        const { quiz } = startedQuiz;
        await expectHttpError(quizResources.getQuestionResults(quiz.quizId, uuid()), 404);
    });

    describe('Answerless questions', () => {
        let questionsPayload: QuestionsPayload;

        beforeAll(async () => {
            const userResources = new UserResources();
            const response = await quizResources.createQuiz({
                title: uuid(),
                potAmount: 500,
            });
            questionsPayload = {
                questions: mockManualQuestionsPayload.questions.map((q) => {
                    return { ...q, choices: q.choices.map(c => ({ ...c, isAnswer: false })) };
                })
            };
            await quizResources.addQuestions(response.quiz.quizId, questionsPayload);
            startedQuiz = await quizResources.startQuiz(response.quiz.quizId);
            const { firstQuestion, quiz } = startedQuiz;
            const answerPromises: Array<Promise<any>> = [];
            for (let i = 0; i < TotalAnswers; i++) {
                answerPromises.push(new Promise((resolve, reject) => {
                    return userResources.getNewUser().then((res) => {
                        const specialQuizResources = new QuizResources(res.token);
                        const randomChoice = getRandomChoice(firstQuestion.choices);
                        specialQuizResources.answerQuestion(
                            quiz.quizId, firstQuestion.questionId, randomChoice
                        ).then(resolve).catch(reject);
                    }).catch(reject);
                }));
            }
            await Promise.all(answerPromises);
        });

        it('should not return the correctAnswer if there is none', async () => {
            const { quiz, firstQuestion } = startedQuiz;
            const results = await quizResources.getQuestionResults(quiz.quizId, firstQuestion.questionId);
            expect(results.correctAnswer, 'Question without answer returned a correctAnswer in the results').toBeUndefined();
        });
    });

    function getRandomChoice(choices: Array<IChoiceResponse>): string {
        return choices[Math.floor(Math.random() * choices.length)].choiceId;
    }
});
