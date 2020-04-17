import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { plugins } from './config.babel'
import production from "./production.babel"

export default {
	...production,
	plugins: [
		...plugins,
		new MiniCssExtractPlugin({
			filename: '[name].min.css',
			chunkFilename: '[name].min.css'
		})
	]
}
