import * as hapi from '@hapi/hapi';

export const devRoutes = (routes: Array<hapi.ServerRoute>): Array<hapi.ServerRoute> => {
    return routes.map(r => {
        r.path = '/dev' + r.path;
        if (!r.options) {
            r.options = {};
        }

        const options: hapi.RouteOptions = r.options as hapi.RouteOptions;

        if (options.tags) {
            options.tags = [...options.tags!, 'api'];
        } else {
            options.tags = ['api'];
        }
        if (options.auth === 'accountJwt') {
            options.tags.push('internal');
        }
        r.options = options;
        return r;
    });
};