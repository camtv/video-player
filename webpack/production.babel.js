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
				parallel: true,
				sourceMap: true,
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
