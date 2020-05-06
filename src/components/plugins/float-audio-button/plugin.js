import "../float-buttons.scss";
import "./plugin.scss";
import videojs from 'video.js';
import FloatAudioButton from './FloatAudioButton';

const defaults = {};

const registerPlugin = videojs.registerPlugin || videojs.plugin;

const onPlayerReady = (player, options) => {
	if (!player.options().floatingControls || !player.options().floatingControls.audioToggle)
		return;

	// Avoid duplicates
	const controlBar = player.controlBar;
	if (!controlBar || controlBar.getChild('FloatAudioButton') != null)
		return;

	player.addClass('vjs-float-audio-button');

	const btn = player.addChild('FloatAudioButton', { ...options });

	if (controlBar)
		player.el().insertBefore(btn.el(), controlBar.el());
	else
		player.el().prepend(btn.el());
};

const floatAudioButton = function (options) {
	this.ready(() => onPlayerReady(this, videojs.mergeOptions(defaults, options)));
	videojs.registerComponent('FloatAudioButton', FloatAudioButton);
};

registerPlugin('floatAudioButton', floatAudioButton);

export default floatAudioButton;