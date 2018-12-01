import * as hapi from 'hapi';

import { SwaggerConfig } from './configs/swagger';
import { GoodConfig } from './configs/good';
import { Environment } from '../types/environments';
import { ApplicationConfig } from '../models/config';

function Plugin() {
    return function (_: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: Array<any>) {
            console.info(`Plugins - registering ${propertyKey}`);
            try {
                await originalMethod.apply(this, args);
                console.info(`Plugins - registered ${propertyKey}`);
            } catch (error) {
                console.error(`Plugins - error occured when registering ${propertyKey}`, error);
            }
        };
        return descriptor;
    };
}

export default class Plugins {
    @Plugin()
    public static async swagger(server: hapi.Server): Promise<void> {
        await Plugins.register(server, [
            require('vision'),
            require('inert'),
            {
                options: SwaggerConfig,
                plugin: require('hapi-swagger')
            }
        ]);
    }

    @Plugin()
    public static async jwt2(server: hapi.Server): Promise<void> {
        await Plugins.register(server, require('hapi-auth-jwt2'));
        const validate = function (decoded: object): { isValid: boolean } {
            return { isValid: !!decoded };
        };
        server.auth.strategy('jwt', 'jwt', {
            key: ApplicationConfig.jwtSecret,
            validate: validate,
            verifyOptions: { algorithms: ['HS256'] },
        });
        server.auth.strategy('internalJwt', 'jwt',
            {
                key: ApplicationConfig.internalSecret,
                validate: validate,
                verifyOptions: { algorithms: ['HS256'] },
            });
        server.auth.default('jwt');
    }

    @Plugin()
    public static async good(server: hapi.Server): Promise<void> {
        await Plugins.register(server, {
            options: GoodConfig,
            plugin: require('good')
        });
    }

    public static async registerAll(server: hapi.Server): Promise<void> {
        if (ApplicationConfig.nodeEnv === Environment.local) {
            await Plugins.swagger(server);
        }
        await Plugins.jwt2(server);
        await Plugins.good(server);
    }

    private static async register(server: hapi.Server, plugin: any): Promise<void> {
        try {
            await server.register(plugin);
        } catch (error) {
            console.error('Error loading plugin', error);
            throw error;
        }
    }
}