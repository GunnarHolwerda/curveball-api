
export function omit<T>(ob: any, omitProperties: Array<string>): T {
    const clone: { [key: string]: any } = { ...(ob as any) };
    omitProperties.forEach(function (v: string) { delete clone[v]; });
    return clone as T;
}