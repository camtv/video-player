import { join } from 'path'
import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isDevelopment = process.env.NODE_ENV !== "production";

export const PATH_ROOT = join(__dirname, '..')
export const PATH_SRC = join(PATH_ROOT, 'src')
export const PATH_ASSETS = join(PATH_ROOT, 'assets')
export const PATH_DIST = join(PATH_ROOT, 'dist')

export default {
	mode: isDevelopment ? 'development' : 'production',
	watch: isDevelopment,
	devtool: isDevelopment ? 'eval-source-map' : false,
	resolve: {
		alias: {
			assets: PATH_ASSETS,
		}
	},
	module: {
		rules: [
			{
				enforce: "pre",
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "eslint-loader",
				options: {
					cache: false,
					configFile: ".eslintrc.json",
				},
			},
			{
				test: /\.js$/,
				loader: 'babel-loader'
			},
			{
				test: /\.(s*)css$/,
				use: [
					MiniCssExtractPlugin.loader, // style-loader to have style in js
					{
						loader: 'css-loader',
						options: {
							sourceMap: true
						}
					},
					"sass-loader",
				]
			},
			{
				test: /\.svg$/,
				use: [
					{
						loader: 'svg-url-loader',
						options: {
							encoding: 'base64',
							limit: 10000, // Above 10kb include file as url
						},
					},
				],
			},
			{
				test: /\.(png|jpg)$/,
				loader: 'file-loader?name=assets/[hash].[ext]'
			}]
	},
	plugins: isDevelopment ? [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
	] : [
			// new BundleAnalyzerPlugin()
		],
	optimization: {
		minimize: !isDevelopment,
		minimizer: [
			new TerserPlugin({
				test: /\.js(\?.*)?$/i,
				parallel: true,
				sourceMap: true,
				terserOptions: {
					compress: {
						drop_console: true,
					}
				}
			}),
			new OptimizeCSSAssetsPlugin({})
		],
	},
	stats: {
		warnings: false,
		assets: false,
		entrypoints: false,
		chunks: false,
		chunkModules: false,
		children: false,
		modules: false,
		version: false,
	},
	devServer: {
		port: 3000,
		publicPath: `http://localhost:3000/`,
		hot: true,
		overlay: true,
		historyApiFallback: true,
		stats: 'minimal'
	}
}
