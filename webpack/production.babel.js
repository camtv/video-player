import TerserPlugin from 'terser-webpack-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import config from './config.babel'

export default {
	...config,
	mode: 'production',
	devtool: false, //'source-map',
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				test: /\.js(\?.*)?$/i,
				exclude: "/node_modules/",
				cache: true,
				parallel: true,
				sourceMap: false,
				terserOptions: {
					compress: {
						drop_console: true,
					}
				}
			}),
			new OptimizeCSSAssetsPlugin({})
		]
	}
}
