import { RouteOptionsPreObject, Request, ResponseToolkit } from 'hapi';
import * as Boom from 'boom';
import { ApplicationConfig } from '../../models/config';
import { Environment } from '../../types/environments';

export const onlyLocalPreHandler: RouteOptionsPreObject = {
    method: async (_: Request, _1: ResponseToolkit): Promise<any> => {
        if (ApplicationConfig.nodeEnv !== Environment.local) {
            throw Boom.notFound();
        }
        return true;
    },
    assign: 'local',

};
