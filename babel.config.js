// Babel config for Jest - enables modern JS syntax in CommonJS test environment
module.exports = {
    presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }]
    ]
};
