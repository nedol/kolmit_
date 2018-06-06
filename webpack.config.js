const path = require('path');
const webpack = require('webpack'); //to access built-in plugins
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {

    devtool: NODE_ENV ==='development'?'cheap-inline-module-source-map':null,
    context: __dirname+'/src',

    entry: {

        pano:'./user/user_entry.js',        user:'./user/user_entry.js',
        admin:'./admin/admin_entry.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: '[name]'
    },
    watch: NODE_ENV ==='development',
    watchOptions: {
        aggregateTimeout:100
    },
    module: {
        rules: [
            {
                test: /\.(jpe?g|png|gif)$/i,
                loader:"file-loader",
                query:{
                    name:'[name].[ext]',
                    outputPath:'images/'
                    //the images will be emmited to public/assets/images/ folder
                    //the images will be put in the DOM <style> tag as eg. background: url(assets/images/image.png);
                }
            },
            {
                test: /\.css$/,
                loaders: ["style-loader","css-loader"]
            }
        ],
        loaders:[
            { test: /\.js/, loader: "babel" },
            { test: /\.css/, loader: "style-loader!css-loader" },
            { test: /\.less$/, loader: "style-loader!css-loader!less-loader" },
            { test: /\.jsx?$/, exclude: /(node_modules|bower_components)/, loader: 'babel?optional[]=runtime&stage=0'},
            { test: /\.png/, loader: "url-loader?limit=100000&mimetype=image/png" },
            { test: /\.gif/, loader: "url-loader?limit=100000&mimetype=image/gif" },
            { test: /\.jpg/, loader: "file-loader" },
            { test: /\.json/, loader: "json-loader" },
            { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' }
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({

            $: 'jquery',
            '$': 'jquery',
            jquery: 'jquery',
            jQuery: 'jquery',
            'window.jquery': 'jquery',
            'window.jQuery': 'jquery',
            AFRAME: "aframe",
            aframe: "aframe"
        }),
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(NODE_ENV),
            LANG: JSON.stringify('ru')
        }),
        //new webpack.IgnorePlugin(/your_package_name_here/),
        // new HtmlWebpackPlugin({
        //    template: './dist/main.tmplt.html'
        // }),

        new webpack.NoEmitOnErrorsPlugin()
        // new webpack.optimize.CommonsChunkPlugin({
        //     name:'common',
        //     chunks:['user', 'admin']
        // })
        //    new ExtractTextPlugin('./src/html/css/main.css'),
   ],
    resolve: {
        alias: {
            jquery: path.join(__dirname, 'node_modules/jquery/src/jquery'),
        },
    }
    ,
    externals: {

    }

};