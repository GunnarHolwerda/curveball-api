export function buildUpatePropertyString(originalProperties: { [key: string]: any }, properties: { [key: string]: any }): string {
    const updateProperties: Array<string> = [];
    for (const property in originalProperties) {
        if (properties.hasOwnProperty(property)) {
            if (properties[property] === originalProperties[property]) {
                continue;
            }
            let value: string;
            if (typeof properties[property] === 'string') {
                value = `'${properties[property]}'`;
            } else if (properties[property] instanceof Date) {
                value = `'${(properties[property] as Date).toUTCString()}'`;
            } else if (properties[property] === undefined || properties[property] === null) {
                value = `NULL`;
            } else {
                value = `${properties[property]}`;
            }
            updateProperties.push(`${property} = ${value}`);
        } else {
            console.warn(`Unknown update property ${property}`);
        }
    }
    return updateProperties.join(',');
}
