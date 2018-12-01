export type AllQtClaims = QTClaims & BaseClaims;

export interface BaseClaims {
    aud: string; // userId
    sub: string; // questionId
    iss: string; // quizId
    jti: string;
    exp: number;
}

export interface QTClaims {
    isLastQuestion: boolean;
    lifeUsed: boolean;
}