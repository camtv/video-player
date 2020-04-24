import { join } from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { PATH_SRC, PATH_DIST } from './webpack.config'
import config from "./webpack.config"

export default {
	...config,
	entry: join(PATH_SRC, './demo/index.js'),
	output: {
		path: join(PATH_DIST, './demo'),
		filename: 'index.js',
	},
	plugins: [
		...config.plugins,
		new MiniCssExtractPlugin({
			filename: '[name].min.css',
			chunkFilename: '[name].min.css'
		})
	]
}
