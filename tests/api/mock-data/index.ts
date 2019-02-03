import { QuestionsPayload } from '../../../src/routes/handlers/quizzes/questions/post-questions';

export const mockManualQuestionsPayload: QuestionsPayload = {
    questions: [
        {
            question: 'What is your favorite color?',
            questionNum: 1,
            topic: 1, // Any
            typeId: 1, // Manual
            ticker: 'Deion Sander',
            choices: [
                { text: 'Blue', isAnswer: true },
                { text: 'Yellow', isAnswer: false },
                { text: 'Red', isAnswer: false }
            ]
        },
        {
            question: 'What is your favorite animal?',
            questionNum: 2,
            topic: 1, // Any
            typeId: 1, // Any
            ticker: 'College World Series',
            choices: [
                { text: 'Cat', isAnswer: true },
                { text: 'Dog', isAnswer: false },
                { text: 'Alligator', isAnswer: false }
            ]
        }
    ]
};

export const nflSpreadQuestionPayload: QuestionsPayload = require('./question-payloads/nfl-spread');