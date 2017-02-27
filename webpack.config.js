const webpack = require('webpack');
const path = require('path');

const sourcePath = path.join(__dirname, './client');
const staticsPath = path.join(__dirname, './static');

module.exports = function(env) {
    const nodeEnv = env && env.prod ? 'production' : 'development';
    const isProd = nodeEnv === 'production';

    const plugins = [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity,
            filename: 'vendor.js',
        }),
        new webpack.EnvironmentPlugin({
            NODE_ENV: nodeEnv,
        }),
        new webpack.NamedModulesPlugin(),
    ];

    if (isProd) {
        plugins.push(
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false,
            }),
            new webpack.optimize.UglifyJsPlugin({
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
                output: {
                    comments: false,
                },
            })
        );
    } else {
        plugins.push(
            new webpack.HotModuleReplacementPlugin()
        );
    }

    return {
        devtool: isProd ? 'source-map' : 'eval',
        context: sourcePath,
        entry: {
            js: './index.js',
            vendor: ['react', 'react-dom', 'socket.io-client', 'js-logger'],
        },
        output: {
            // https://webpack.js.org/guides/code-splitting/
            // https://webpack.js.org/guides/caching/
            path: staticsPath,
            // filename: '[name].[chunkhash].js',
            filename: '[name].js',
        },
        resolve: {
            extensions: ['.js', '.jsx'],
        },
        module: {
            rules: [
                {
                    test: /\.html$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'file-loader',
                        query: {
                            name: '[name].[ext]',
                        },
                    },
                },
                {
                    test: /\.css$/,
                    exclude: /node_modules/,
                    use: [
                        'style-loader',
                        'css-loader',
                    ],
                },
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        query: {
                            presets: [
                                ['es2015', { 'modules': false }],
                                'react',
                            ],
                            plugins: [
                                'dynamic-import-webpack',
                            ],
                            cacheDirectory: '/tmp',
                        },

                    },
                },
            ],
        },
        // resolve: {
        //     extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.jsx'],
        //     modules: [
        //         path.resolve(__dirname, 'node_modules'),
        //         sourcePath,
        //     ],
        // },

        plugins,

        performance: isProd && {
            maxAssetSize: 100,
            maxEntrypointSize: 300,
            hints: 'warning',
        },

        // stats: {
        //     colors: {
        //         green: '\u001b[32m',
        //     },
        // },

        devServer: {
            contentBase: './client',
            historyApiFallback: true,
            // host: '0.0.0.0',
            port: 3000,
            compress: isProd,
            inline: !isProd,
            hot: !isProd,
            stats: {
                assets: true,
                children: false,
                chunks: false,
                hash: false,
                modules: false,
                publicPath: false,
                timings: true,
                version: false,
                warnings: true,
                // colors: {
                //     green: '\u001b[32m',
                // },
            },
        },
    };
};



// module.exports = {
//     entry: {
//         js: './client/index.js',
//         vendor: ['react'],
//     },
//     output: {
//         path: './static/js',
//         publicPath: 'js/',
//         filename: '[name].bundle.js',
//     },
//     plugins: [
//         // new webpack.NamedModulesPlugin(),
//         new webpack.optimize.CommonsChunkPlugin({
//             name: 'vendor',
//             minChunks: Infinity,
//             filename: 'vendor.bundle.js',
//         }),
//
//         new webpack.LoaderOptionsPlugin({
//             minimize: true,
//             debug: false,
//         }),
//
//         new webpack.LoaderOptionsPlugin({
//             minimize: true,
//             debug: false,
//         }),
//         new webpack.optimize.UglifyJsPlugin({
//             beautify: true,
//             mangle: {
//                 screw_ie8: true,
//                 keep_fnames: true,
//             },
//             compress: {
//                 warnings: false,
//                 screw_ie8: true,
//                 conditionals: true,
//                 unused: true,
//                 comparisons: true,
//                 sequences: true,
//                 dead_code: true,
//                 evaluate: true,
//                 if_return: true,
//                 join_vars: true,
//             },
//             comments: false,
//         }),
//     ],
//     module: {
//         loaders: [
//             {
//                 test: /\.(js|jsx)$/,
//                 exclude: /node_modules/,
//                 loader: 'babel-loader',
//                 query: {
//                     presets: [
//                         ['es2015', { 'modules': false }],
//                         'react',
//                     ],
//                     cacheDirectory: '/tmp',
//                 },
//             },
//         ],
//     },
//     performance: {
//         maxAssetSize: 100,
//         maxEntrypointSize: 300,
//         hints: 'warning',
//     },
// };
