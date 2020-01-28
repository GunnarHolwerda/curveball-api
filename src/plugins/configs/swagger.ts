import * as HapiSwagger from 'hapi-swagger';
const pkg = require('../../../package.json');

export const SwaggerConfig: HapiSwagger.RegisterOptions = {
    info: {
        title: 'Curveball API Documentation',
        version: pkg.version
    },
    basePath: '/',
    documentationPath: '/docs',
    sortEndpoints: 'ordered'
};