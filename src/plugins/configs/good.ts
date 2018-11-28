export const GoodConfig = {
    ops: {
        interval: 100
    },
    reporters: {
        consoleReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ log: '*', response: '*', error: '*' }]
        },
        { module: 'good-console' },
            'stdout'
        ]
    }
};