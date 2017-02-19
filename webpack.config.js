const webpack = require('webpack');

module.exports = {
    entry: {
        js: './client/index.js',
        vendor: ['react'],
    },
    output: {
        path: './static/js',
        publicPath: 'js/',
        filename: '[name].bundle.js',
    },
    plugins: [
        // new webpack.NamedModulesPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity,
            filename: 'vendor.bundle.js',
        }),

        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
        }),

        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
        }),
        new webpack.optimize.UglifyJsPlugin({
            beautify: true,
            mangle: {
                screw_ie8: true,
                keep_fnames: true,
            },
            compress: {
                warnings: false,
                screw_ie8: true,
                conditionals: true,
                unused: true,
                comparisons: true,
                sequences: true,
                dead_code: true,
                evaluate: true,
                if_return: true,
                join_vars: true,
            },
            comments: false,
        }),
    ],
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: [
                        ['es2015', { 'modules': false }],
                        'react',
                    ],
                    cacheDirectory: '/tmp',
                },
            },
        ],
    },
    performance: {
        maxAssetSize: 100,
        maxEntrypointSize: 300,
        hints: 'warning',
    },
};
