export class ApplicationConfig {

    public static get redisHost(): string {
        return process.env.REDIS_HOST!;
    }

    public static get redisPort(): number {
        return +(process.env.REDIS_PORT!);
    }

    public static get sslCert(): string | undefined {
        return process.env.SSL_CERT_PATH;
    }

    public static get sslKey(): string | undefined {
        return process.env.SSL_CERT_KEY;
    }

    public static get jwtSecret(): string {
        return process.env.JWT_SECRET!;
    }

    public static get internalSecret(): string {
        return process.env.INTERNAL_SECRET!;
    }

    public static get nodeEnv(): string {
        return process.env.NODE_ENV!;
    }
}