const path = require('path')

module.exports = {

    entry: './build/jungle.js',
    output: {
        library:'Jungle',
        path: path.resolve( __dirname, 'dist'),
        filename: "jungle.js"
    }
    
}
