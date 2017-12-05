const path = require('path')

var serverConfig = {
    target: 'node',
    entry: path.resolve(__dirname, 'build', 'jungle.js'),
    output: {
        library:'jungle-core',
        libraryTarget:'commonjs2',
        path: path.resolve(__dirname, 'dist'),
        filename: 'jungle.node.js'
    }
};

var clientConfig = {
    entry: path.resolve(__dirname, 'build', 'jungle.js'),
    output: {
        library: 'Jungle',
        path: path.resolve(__dirname, 'dist'),
        filename: 'jungle.js'
    }
};

module.exports = [serverConfig, clientConfig];
