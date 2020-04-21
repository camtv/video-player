import "./plugin.scss";
import videojs from 'video.js';
import "videojs-contrib-quality-levels";
import SourceMenuButton from './SourceMenuButton';
import SourceMenuItem from "./SourceMenuItem";

const defaults = {};

const registerPlugin = videojs.registerPlugin || videojs.plugin;

const onPlayerReady = (player, options) => {
	player.addClass('vjs-http-source-selector');

	if (player.techName_ != 'Html5')
		return false;

	player.on(['loadedmetadata'], function () {
		player.qualityLevels();

		videojs.log('loadmetadata event');

		// prevents duplicates
		if (player.isSourceSelectorInitialized === true)
			return;
		player.isSourceSelectorInitialized = true;

		// Inserts the source menu button in control bar
		player.videojs_http_source_selector_initialized = true;
		const controlBar = player.controlBar;
		const fullscreenToggle = controlBar.getChild('fullscreenToggle').el();
		player.controlBar.sourceMenuButton = controlBar.addChild('SourceMenuButton', { ...options });
		controlBar.el().insertBefore(player.controlBar.sourceMenuButton.el(), fullscreenToggle);
	});
};

// Exported function
const httpSourceSelector = function (options) {
	this.ready(() => onPlayerReady(this, videojs.mergeOptions(defaults, options)));
	videojs.registerComponent('SourceMenuButton', SourceMenuButton);
	videojs.registerComponent('SourceMenuItem', SourceMenuItem);
};

// Register the plugin with video.js.
registerPlugin('httpSourceSelector', httpSourceSelector);

export default httpSourceSelector;