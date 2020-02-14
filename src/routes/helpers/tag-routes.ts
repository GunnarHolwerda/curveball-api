import * as hapi from '@hapi/hapi';

export const tagRoutes = (routes: Array<hapi.ServerRoute>): Array<hapi.ServerRoute> => {
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
            options.tags.push('web-app');
        } else {
            options.tags.push('mobile-app');
        }
        r.options = options;
        return r;
    });
};