const path = require('path');
const { DefinePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = (env = {}) => {
    return {
        entry: './src/index.tsx',
        target: 'web',
        mode: env.production ? 'production' : 'development',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js',
        },
        resolve: {
            extensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.d.ts'],
            plugins: [ new TsconfigPathsPlugin() ]
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    loader: 'ts-loader',
                    options: {
                        projectReferences: true
                    }
                },
                {
                    enforce: 'pre',
                    test: /\.js$/,
                    loader: 'source-map-loader',
                }
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, 'src', 'components', 'index.html'),
                baseUrl: require('./src/environments/' + (env.production ? 'production' : 'development') + '.json').PUBLIC_URL + '/'
            }),
            new DefinePlugin({
                'process.env': {
                    NODE_ENV: env.production ? '"production"' : '"development"'
                }
            })
        ],
    };
};
