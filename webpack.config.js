const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
module.exports = {
    entry: {
        home: './src/index.js',
        chat: './src/chat.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
        publicPath: ''
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                    use: {
                            loader: "babel-loader",
                        }
            },
            {
                test: /\.scss$/,
                use: [
                    {
                      loader: "style-loader" // creates style nodes from JS strings
                    },
                    {
                      loader: "css-loader" // translates CSS into CommonJS
                    },
                    {
                      loader: "sass-loader" // compiles Sass to CSS
                    }
                  ]
                    
            },
            {
                test: /\.html$/,
                    use: 
                        {
                            loader: "html-loader",
                            options: { minimize: true }
                        }
            },
            {
                test: /\.(png|svg|jpg|gif|mp3)$/,
                    use: [
                        "file-loader?name=./res/[name].[ext]"
                    ]
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/views/home.html",
            filename: "home.html",
            chunks: ['home']
        }),
        new HtmlWebPackPlugin({
            template: "./src/views/chat.html",
            filename: "chat.html",
            chunks: ['chat']
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
        new CleanWebpackPlugin()
    ]
}