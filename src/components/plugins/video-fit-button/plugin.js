import "../float-buttons.scss";
import "./plugin.scss";
import videojs from 'video.js';
import VideoFitButton from './VideoFitButton';

const defaults = {};

const registerPlugin = videojs.registerPlugin || videojs.plugin;

const onPlayerReady = (player, options) => {
	if (!player.options().controls || !player.options().controls.videoFit == false)
		return;

	// prevents duplicates
	if (player.isVideoFitButtonInitialized === true)
		return;
	player.isVideoFitButtonInitialized = true;

	// Inserts the source menu button in control bar
	const controlBar = player.controlBar;
	if (controlBar) {
		player.controlBar.videoFitButton = controlBar.addChild('VideoFitButton', { ...options });
		const fullscreenToggle = controlBar.getChild('fullscreenToggle');
		if (fullscreenToggle)
			controlBar.el().insertBefore(player.controlBar.videoFitButton.el(), fullscreenToggle.el());
		else
			controlBar.el().append(player.controlBar.videoFitButton.el())
	}
};

const videoFitButton = function (options) {
	this.ready(() => onPlayerReady(this, videojs.mergeOptions(defaults, options)));
	videojs.registerComponent('VideoFitButton', VideoFitButton);
};

registerPlugin('videoFitButton', videoFitButton);

export default videoFitButton;