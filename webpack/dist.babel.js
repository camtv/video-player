import { join } from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { PATH_SRC, PATH_DIST } from './config.babel'
import production from "./production.babel"

export default {
	...production,
	entry: join(PATH_SRC, "module.js"),
	output: {
		path: PATH_DIST,
		filename: 'video-player.js',
		library: 'videoPlayer',
		libraryTarget: "umd",
		libraryExport: "default"
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'video-player.css',
			chunkFilename: '[name].css'
		})
	]
}
