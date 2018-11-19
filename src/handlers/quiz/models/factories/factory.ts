import { CbRedis } from '../cb-redis';
import { Cacheable } from '../../interfaces/cacheable';

export class Factory {
    protected static cacheKey(id: string): string {
        return id;
    }

    public static async Cache(id: string, cacheable: Cacheable, secondsToExpire: number = 300): Promise<void> {
        await CbRedis.instance.client.setex(this.cacheKey(id), secondsToExpire, JSON.stringify(cacheable.cachify()));
    }

    public static async LoadFromCache<T>(key: string): Promise<T | null> {
        const cachedValue = await CbRedis.instance.client.get(key);
        return cachedValue ? JSON.parse(cachedValue) as T : null;
    }
}