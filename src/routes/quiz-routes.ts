import * as hapi from 'hapi';
import { IoServer } from '../models/namespaces/io-server';
import { deleteQuiz } from './handlers/quizzes/delete-quiz';
import { getQuiz } from './handlers/quizzes/get-quiz';
import { getQuizAccess } from './handlers/quizzes/get-quiz--access';
import { getQuizzes } from './handlers/quizzes/get-quizzes';
import { postQuizComplete } from './handlers/quizzes/post-quiz--complete';
import { postQuizReset } from './handlers/quizzes/post-quiz--reset';
import { postQuizzesStart } from './handlers/quizzes/post-quiz--start';
import { postQuizzes, postQuizzesSchema } from './handlers/quizzes/post-quizzes';
import { putQuiz, putQuizSchema } from './handlers/quizzes/put-quiz';
import { getQuestionResults } from './handlers/quizzes/questions/get-question--results';
import { getQuestions } from './handlers/quizzes/questions/get-questions';
import { answerQuestion, questionsAnswerSchema } from './handlers/quizzes/questions/post-question--answer';
import { postQuestionStart } from './handlers/quizzes/questions/post-question--start';
import { postQuestions, postQuestionsSchema } from './handlers/quizzes/questions/post-questions';
import { getQuizUsers } from './handlers/quizzes/users/get-quiz-users';
import { postUserForceLogin, postUserForceLoginSchema } from './handlers/users/post-user--forcelogin';
import { qtPreRouteHandler } from './pres/qt-access';

export function quizRoutes(server: hapi.Server, _: IoServer): void {
    const routes: Array<hapi.ServerRoute> = [
        {
            path: '/users_force_login',
            method: 'post',
            options: {
                auth: 'internalJwt',
                validate: { payload: postUserForceLoginSchema },
                description: 'Force login as a certain phone number',
                notes: 'Bypasses the text verification for logging in, user must already exist'
            },
            handler: postUserForceLogin
        },
        {
            path: '/quizzes',
            method: 'post',
            options: {
                auth: 'internalJwt',
                validate: { payload: postQuizzesSchema },
                description: 'Create a Quiz',
                notes: 'Creates a quiz'
            },
            handler: postQuizzes
        },
        {
            path: '/quizzes/{quizId}',
            method: 'put',
            options: {
                auth: 'internalJwt',
                validate: { payload: putQuizSchema },
                description: 'Update quiz information',
                notes: 'Updates the metadata for a quiz'
            },
            handler: putQuiz
        },
        {
            path: '/quizzes/{quizId}',
            method: 'delete',
            options: {
                auth: 'internalJwt',
                description: 'Delete a quiz',
                notes: 'Marks the quiz as deleted, will no longer be returned by ' +
                    'endpoints to retrieve lists of quizzes, but can still be accessed'
            },
            handler: deleteQuiz
        },
        {
            path: '/quizzes/{quizId}',
            method: 'get',
            options: {
                auth: 'internalJwt',
                description: 'Retrieve quiz information',
                notes: 'Returns full quiz information with question data'
            },
            handler: getQuiz
        },
        {
            path: '/quizzes/{quizId}/questions',
            method: 'post',
            options: {
                auth: 'internalJwt',
                validate: { payload: postQuestionsSchema },
                description: 'Add questions to quiz',
                notes: 'Creates and adds questions to a quiz'
            },
            handler: postQuestions
        },
        {
            path: '/quizzes/{quizId}/questions',
            method: 'get',
            options: {
                auth: 'internalJwt',
                description: 'Get all questions for quiz',
                notes: 'Retrieves all questions for a quiz and their full choice information'
            },
            handler: getQuestions
        },
        {
            path: '/quizzes/{quizId}/start',
            method: 'post',
            options: {
                auth: 'internalJwt',
                description: 'Start a quiz',
                notes: 'Marks quiz as active, starts the first question and returns it'
            },
            handler: postQuizzesStart
        },
        {
            path: '/quizzes/{quizId}/questions/{questionId}/answer',
            method: 'post',
            options: {
                pre: [qtPreRouteHandler],
                validate: { payload: questionsAnswerSchema },
                description: 'Submit answer to question',
                notes: 'Submits an answer to a particiular question'
            },
            handler: answerQuestion
        },
        {
            path: '/quizzes/{quizId}/questions/{questionId}/start',
            method: 'post',
            options: {
                auth: 'internalJwt',
                description: 'Start a question',
                notes: 'Marks question as sent and returns it'
            },
            handler: postQuestionStart
        },
        {
            path: '/quizzes/{quizId}/questions/{questionId}/results',
            method: 'get',
            options: {
                auth: 'internalJwt',
                description: 'Retrieve results for a question',
                notes: 'Calculate total number of answers for each choice of a question and get data'
            },
            handler: getQuestionResults
        },
        {
            path: '/quizzes',
            method: 'get',
            options: {
                auth: 'internalJwt',
                description: 'Retrieve quizzes',
                notes: 'Get all quizzes'
            },
            handler: getQuizzes
        },
        {
            path: '/quizzes/{quizId}/users',
            method: 'get',
            options: {
                auth: 'internalJwt',
                description: 'Retrieve users still alive in quiz',
                notes: 'Determines which users have answered all questions up to most recently sent and returns them'
            },
            handler: getQuizUsers
        },
        {
            path: '/quizzes/{quizId}/reset',
            method: 'post',
            options: {
                auth: 'internalJwt',
                description: 'Reset all quiz data',
                notes: 'Removes all answers for quiz, marks all questions as unsent, and removes completed from quiz'
            },
            handler: postQuizReset
        },
        {
            path: '/quizzes/{quizId}/complete',
            method: 'post',
            options: {
                auth: 'internalJwt',
                description: 'Finish a quiz',
                notes: 'Mark quiz as completed'
            },
            handler: postQuizComplete
        },
        {
            path: '/quizzes/{quizId}/access',
            method: 'get',
            options: {
                description: 'Retrieve access token for quiz',
                notes: 'Returns token if you have access to requested quiz'
            },
            handler: getQuizAccess
        },
    ];

    const devRoutes = routes.map(r => {
        r.path = '/dev' + r.path;
        if (!r.options) {
            r.options = {};
        }

        const options: hapi.RouteOptions = r.options as hapi.RouteOptions;

        if (options.tags) {
            options.tags = [...options.tags!, 'api'];
        } else {
            options.tags = ['api'];
        }
        if (options.auth === 'internalJwt') {
            options.tags.push('internal');
        }
        r.options = options;
        return r;
    });

    devRoutes.forEach(r => server.route(r));
}