export interface UserJwtClaims {
    jti: string;
    iat: number;
    userId: string;
    name: string;
    username: string;
    photo: string;
    data: any;
}