export function camelizeKeys<T = any>(ob: object, seperator: string = '_'): T {
    const clone: { [key: string]: any } = { ...ob };
    for (const key in ob) {
        if (ob.hasOwnProperty(key)) {
            const value = clone[key];
            delete clone[key];
            const keyParts = key.split(seperator);
            const camelizedKey = keyParts[0] + keyParts.slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
            if (Array.isArray(value)) {
                clone[camelizedKey] = value.map((v: any) => {
                    return camelizeKeys(v);
                });
            } else if (typeof value === 'object' && !(value instanceof Date) && value !== null) {
                clone[camelizedKey] = camelizeKeys(value);
            } else {
                clone[camelizedKey] = value;
            }
        }
    }
    return clone as T;
}