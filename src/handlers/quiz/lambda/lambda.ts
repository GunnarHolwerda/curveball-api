import { QTClaims, BaseClaims } from '../models/qt';

export interface UserJwtClaims {
    jti: string;
    iat: number;
    userId: string;
    name: string;
    username: string;
    photo: string;
    data: any;
}

export type AllQtClaims = QTClaims & BaseClaims;

export namespace CurveballLambda {

    export const CurveballErrorResponse: Response = {
        statusCode: 500,
        body: {
            message: 'Internal Server Error'
        }
    };

    export interface Dictionary {
        [key: string]: string;
    }

    export interface Identity {
        cognitoIdentityPoolId: string;
        accountId: string;
        cognitoIdentityId: string;
        caller: string;
        apiKey: string;
        sourceIp: string;
        cognitoAuthenticationType: string;
        cognitoAuthenticationProvider: string;
        userArn: string;
        userAgent: string;
        user: string;
    }

    export interface Authorizer {
        principalId: string;
        userClaims: UserJwtClaims;
        quizClaims: AllQtClaims;
    }

    export interface RequestContext {
        accountId: string;
        resourceId: string;
        apiId: string;
        stage: string;
        requestId: string;
        identity: Identity;
        authorizer: Authorizer;
        protocol: string;
        resourcePath: string;
        httpMethod: string;
    }

    export interface Event {
        headers: Dictionary;
        path: string;
        pathParameters: Dictionary;
        requestContext: RequestContext;
        authorizationToken: string;
        methodArn: string;
        resource: string;
        httpMethod: string;
        queryStringParameters?: Dictionary;
        stageVariables?: any;
        body?: string; // json encoded string
        isOffline: boolean;
    }

    export interface Response<T = any> {
        statusCode: number;
        body: T;
    }

    export function getEventPayload<T>(event: Event): T {
        const originalPayload = JSON.parse(event.body!);
        return originalPayload as T;
    }
}
