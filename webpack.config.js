const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const dotenv = require('dotenv');
const env = dotenv.config().parsed
const envKeys = Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next])
    return prev
}, {});

module.exports = {
    entry: './src/index.js',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ]
    },
    optimization: {
        minimizer: [
            new CssMinimizerPlugin({
                minimizerOptions: {
                    level: {
                        1: {
                            roundingPrecision: "all=3,px=5",
                        },
                    },
                },
                minify: CssMinimizerPlugin.cleanCssMinify,
            }),
        ],
        minimize: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
        }),
        new CopyPlugin({
            patterns: [
                { from: "./src/templates", to: "templates" },
                { from: "./src/plugins/css", to: "css" },
                { from: "./src/plugins/js", to: "js" },
                { from: "./src/framework/js/jquery.toast.js", to: "js" },
                { from: "./src/plugins/webfonts", to: "webfonts" },
                { from: "./src/plugins/fonts", to: "css/fonts" },
                { from: "./src/assets/images", to: "images" },
                { from: "./.env", to: "./" },
            ],
        }),
        new MiniCssExtractPlugin(),
        new webpack.DefinePlugin(envKeys)
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        clean: true,
    },
    devServer: {
        static: '.dist',
        compress: true,
        historyApiFallback: true, /* If you want to use location.pathname for SPA */
        port: 9000,
    },
};