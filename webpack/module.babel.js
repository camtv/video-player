import { join } from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { PATH_SRC, PATH_DIST } from './webpack.config'
import config from "./webpack.config"

export default {
	...config,
	entry: join(PATH_SRC, "module.js"),
	output: {
		path: PATH_DIST,
		filename: 'video-player.js',
		library: 'RenderVideoCamTV',
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	plugins: [
		...config.plugins,
		new MiniCssExtractPlugin({
			filename: 'video-player.css',
			chunkFilename: '[name].css'
		})
	]
}
