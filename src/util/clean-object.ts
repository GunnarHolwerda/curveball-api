/**
 * Remove undefined and null keys from an object
 * @param obj object to remove null and undefined values from
 */
export function cleanObject<T>(obj: object): T {
    const newObj = { ...obj };

    Object.keys(newObj).forEach((key) => {
        if (typeof newObj[key] === 'undefined' || newObj[key] === null) {
            delete newObj[key];
        }
    });

    return newObj as T;
}