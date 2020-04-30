import { join } from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { PATH_SRC, PATH_DIST } from './webpack.config'
import config from "./webpack.config"

export default {
	...config,
	entry: join(PATH_SRC, "standalone.js"),
	output: {
		path: PATH_DIST,
		filename: 'video-player.standalone.js',
		libraryTarget: 'window',
	},
	plugins: [
		...config.plugins,
		new MiniCssExtractPlugin({
			filename: 'video-player.standalone.css',
			chunkFilename: '[name].standalone.css'
		})
	]
}
