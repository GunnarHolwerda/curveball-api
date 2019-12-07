const config = require('./config.json');

export const GetEnvConfigValue = (property: string): string | number => {
    return config[property];
};