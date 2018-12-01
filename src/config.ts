export class ApplicationConfig {

    public static get redisHost(): string {
        return process.env.REDIS_HOST!;
    }

    public static get redisPort(): number {
        return +(process.env.REDIS_PORT!);
    }

    public static get sslCert(): string | undefined {
        return process.env.SSL_CERT;
    }

    public static get sslKey(): string | undefined {
        return process.env.SSL_KEY;
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

    public static get qtSecret(): string {
        return process.env.QT_SECRET!;
    }

    public static get twilioKey(): string {
        return process.env.TWILIO_KEY!;
    }

    public static get mixpanelKey(): string {
        return process.env.MIXPANEL_TOKEN!;
    }
}