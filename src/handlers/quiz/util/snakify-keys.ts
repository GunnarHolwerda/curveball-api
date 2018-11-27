export function snakifyKeys<T = any>(ob: object): T {
    const clone: { [key: string]: any } = { ...ob };
    for (const key in ob) {
        if (ob.hasOwnProperty(key)) {
            const value = clone[key];
            const snakeKey = key.split(/(?=[A-Z])/).join('_').toLowerCase();
            delete clone[key];
            if (Array.isArray(value)) {
                clone[snakeKey] = value.map((v: any) => {
                    return snakifyKeys(v);
                });
            } else if (typeof value === 'object' && !(value instanceof Date) && value !== null) {
                clone[snakeKey] = snakifyKeys(value);
            } else {
                clone[snakeKey] = value;
            }
        }
    }
    return clone as T;
}