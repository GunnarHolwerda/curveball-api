import * as Redis from 'ioredis';

const CurveballRedisKeyPrefix = 'CB-Realtime-';

export class CbRedis {
    private redisClient: Redis.Redis;
    private static _instance: CbRedis;

    private constructor() {
        this.redisClient = new Redis(+(process.env.REDIS_PORT!), process.env.REDIS_HOST!, {
            keyPrefix: CurveballRedisKeyPrefix
        });
    }

    public static get instance(): CbRedis {
        if (!this._instance) {
            this._instance = new CbRedis();
        }
        return this._instance;
    }

    public get client(): Redis.Redis {
        return this.redisClient;
    }
}