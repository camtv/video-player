import { join } from 'path'
import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const PORT = 3000
const PRODUCTION = process.env.NODE_ENV === 'production'
const PUBLIC_PATH = PRODUCTION ? '' : `http://localhost:${PORT}/`
const STYLE_LOADER = PRODUCTION ? MiniCssExtractPlugin.loader : 'style-loader'

export const PATH_ROOT = join(__dirname, '..')
export const PATH_SRC = join(PATH_ROOT, 'src')
const PATH_NODE_MODULES = join(PATH_ROOT, 'node_modules')
const PATH_ASSETS = join(PATH_ROOT, 'assets')
const PATH_DEMO_INPUT = join(PATH_ROOT, '/src/demo')
const PATH_DEMO_OUTPUT = join(PATH_ROOT, 'dist/demo')
export const PATH_DIST = join(PATH_ROOT, 'dist')

export const plugins = [
	new HtmlWebpackPlugin({
		template: join(PATH_DEMO_INPUT, "index.html"),
		minify: {
			collapseWhitespace: true,
			quoteCharacter: '\''
		}
	})
]

export default {
	mode: 'development',
	devtool: 'source-map',
	entry: join(PATH_DEMO_INPUT, 'index.js'),
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
					configFile: ".eslintrc.json",
				},
			},
			{
				test: /\.js$/,
				include: PATH_SRC,
				loader: 'babel-loader'
			},
			{
				test: /\.(s*)css$/,
				include: PATH_SRC,
				use: [
					STYLE_LOADER,
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
				test: /\.css$/,
				include: PATH_NODE_MODULES,
				use: [
					STYLE_LOADER,
					'css-loader?sourceMap'
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
				include: PATH_ASSETS,
				loader: 'file-loader?name=assets/[hash].[ext]'
			}]
	},
	output: {
		path: PATH_DEMO_OUTPUT,
		filename: 'index.js',
		publicPath: PUBLIC_PATH
	},
	plugins: [
		...plugins,
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin()
	],
	devServer: {
		port: PORT,
		publicPath: PUBLIC_PATH,
		hot: true,
		overlay: true,
		historyApiFallback: true,
		stats: 'minimal'
	},
	performance: {
		hints: false
	}
}
