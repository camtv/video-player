import "../float-buttons.scss";
import "./plugin.scss";
import videojs from 'video.js';
import FloatAudioButton from './FloatAudioButton';

const defaults = {};

const registerPlugin = videojs.registerPlugin || videojs.plugin;

const onPlayerReady = (player, options) => {
	if (!player.options().floatingControls || !player.options().floatingControls.audioToggle)
		return;

	player.addClass('vjs-float-audio-button');

	const controlBar = player.controlBar;

	player.floatAudioButton = player.addChild('FloatAudioButton', { ...options });

	if (controlBar)
		player.el().insertBefore(player.floatAudioButton.el(), controlBar.el().nextSibling);
	else
		player.el().append(player.floatAudioButton.el())

};

const floatAudioButton = function (options) {
	this.ready(() => onPlayerReady(this, videojs.mergeOptions(defaults, options)));
	videojs.registerComponent('FloatAudioButton', FloatAudioButton);
};

registerPlugin('floatAudioButton', floatAudioButton);

export default floatAudioButton;