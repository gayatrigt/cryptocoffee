import { kv } from '@vercel/kv';

let localCache: Map<string, any>;

type CacheSetOptions = {
    ex?: number;
    nx?: boolean;
    xx?: boolean;
    get?: boolean;
    exat?: number;
    pxat?: number;
    keepTtl?: boolean;
};

export const cache = {
    get: async (key: string) => {
        if (process.env.NODE_ENV === 'production') {
            return kv.get(key);
        } else {
            return localCache.get(key);
        }
    },
    set: async (key: string, value: any, options?: CacheSetOptions) => {
        if (process.env.NODE_ENV === 'production') {
            return kv.set(key, value, options as any);
        } else {
            localCache.set(key, value);
            if (options?.ex) {
                setTimeout(() => localCache.delete(key), options.ex * 1000);
            }
        }
    },
    // You can add more methods as needed, like delete, clear, etc.
};

if (process.env.NODE_ENV !== 'production') {
    localCache = new Map();
}