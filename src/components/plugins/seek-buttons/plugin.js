import videojs from 'video.js';
import SeekButton from './SeekButton';

const defaults = {};

const registerPlugin = videojs.registerPlugin || videojs.plugin;

const onPlayerReady = (player, options) => {
	// Avoid duplicates
	const controlBar = player.controlBar;
	if (!controlBar || controlBar.getChild('SeekButton') != null)
		return;

	player.addClass('vjs-seek-buttons');

	const playButton = controlBar.getChild('PlayToggle');

	if (options.forward && options.forward > 0) {
		controlBar.seekForward = controlBar.addChild('SeekButton', {
			direction: 'forward',
			seconds: options.forward || 30
		});
		if (playButton)
			controlBar.el().insertBefore(controlBar.seekForward.el(), playButton.el().nextSibling);
		else
			controlBar.el().prepend(controlBar.seekForward.el())
	}

	if (options.back && options.back > 0) {
		controlBar.seekBack = controlBar.addChild('SeekButton', {
			direction: 'back',
			seconds: options.back || 30
		});
		if (playButton)
			controlBar.el().insertBefore(controlBar.seekBack.el(), playButton.el().nextSibling);
		else
			controlBar.el().prepend(controlBar.seekBack.el())
	}
};

const seekButtons = function (options) {
	this.ready(() => onPlayerReady(this, videojs.mergeOptions(defaults, options)));
	videojs.registerComponent('SeekButton', SeekButton);
};

registerPlugin('seekButtons', seekButtons);

export default seekButtons;