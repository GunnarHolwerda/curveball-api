import * as uuid from 'uuid';

import { mockQuestionsPayload } from '../mock-data';
import { Test } from '../resources/quiz-resources';
import { expectHttpError } from '../resources/test-helpers';
import { Test as TestUser } from '../resources/user-resources';
import { IChoiceResponse } from '../../../src/handlers/quiz/models/question-choice';
import { QuestionsPayload } from '../../../src/handlers/quiz/functions/quizzes/questions/post-questions';

describe('GET /quizzes/{quizId}/questions/{questionId}:results', () => {
    const TotalAnswers = 15;
    let quizResources: Test.QuizResources;
    let startedQuiz: Test.QuizStartResponse;

    beforeAll(async () => {
        quizResources = new Test.QuizResources();
        const userResources = new TestUser.UserResources();
        const response = await quizResources.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        await quizResources.addQuestions(response.quiz.quizId, mockQuestionsPayload);
        startedQuiz = await quizResources.startQuiz(response.quiz.quizId);
        const { firstQuestion, quiz } = startedQuiz;
        const answerPromises: Array<Promise<any>> = [];
        for (let i = 0; i < TotalAnswers; i++) {
            answerPromises.push(new Promise((resolve, reject) => {
                return userResources.getNewUser().then((res) => {
                    const specialQuizResources = new Test.QuizResources(res.token);
                    const randomChoice = getRandomChoice(firstQuestion.choices);
                    specialQuizResources.answerQuestion(
                        quiz.quizId, firstQuestion.questionId, randomChoice
                    ).then(resolve).catch(reject);
                }).catch(reject);
            }));
        }
        await Promise.all(answerPromises);
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
                expect(results[choiceId]).toBeGreaterThanOrEqual(0, 'The question results did not return a valid number of selections');
                numberOfChoicesReturned++;
            }
        }
        expect(numberOfChoicesReturned).toBe(firstQuestion.choices.length, 'Not all choices were returned in results');
    });

    it('should return the correctAnswer for the question', async () => {
        const { quiz, firstQuestion } = startedQuiz;
        const results = await quizResources.getQuestionResults(quiz.quizId, firstQuestion.questionId);
        const correctAnswerText = mockQuestionsPayload.questions[0].choices.find(c => c.isAnswer!)!.text!;
        expect(results.correctAnswer).toBe(firstQuestion.choices.find(c => c.text === correctAnswerText)!.text);
    });

    it('should return 404 question does not belong to quiz', async () => {
        const { firstQuestion } = startedQuiz;
        await expectHttpError(quizResources.getQuestionResults('wonder', firstQuestion.questionId), 404);
    });

    it('should return 404 if question does not exist', async () => {
        const { quiz } = startedQuiz;
        await expectHttpError(quizResources.getQuestionResults(quiz.quizId, 'wow'), 404);
    });

    describe('Answerless questions', () => {
        let questionsPayload: QuestionsPayload;

        beforeAll(async () => {
            const userResources = new TestUser.UserResources();
            const response = await quizResources.createQuiz({
                title: uuid(),
                potAmount: 500,
            });
            questionsPayload = {
                questions: mockQuestionsPayload.questions.map((q) => {
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
                        const specialQuizResources = new Test.QuizResources(res.token);
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
            expect(results.correctAnswer).toBeUndefined('Question without answer returned a correctAnswer in the results');
        });
    });

    function getRandomChoice(choices: Array<IChoiceResponse>): string {
        return choices[Math.floor(Math.random() * choices.length)].text;
    }
});
