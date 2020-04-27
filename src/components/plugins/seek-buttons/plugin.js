import videojs from 'video.js';
import SeekButton from './SeekButton';

const defaults = {};

const registerPlugin = videojs.registerPlugin || videojs.plugin;

const onPlayerReady = (player, options) => {
	player.addClass('vjs-seek-buttons');

	if (!player.controlBar)
		return;

	const playButton = player.controlBar.getChild('PlayToggle');

	if (options.forward && options.forward > 0) {
		player.controlBar.seekForward = player.controlBar.addChild('SeekButton', {
			direction: 'forward',
			seconds: options.forward || 30
		});
		if (playButton)
			player.controlBar.el().insertBefore(player.controlBar.seekForward.el(), playButton.el().nextSibling);
		else
			player.controlBar.el().prepend(player.controlBar.seekForward.el())
	}

	if (options.back && options.back > 0) {
		player.controlBar.seekBack = player.controlBar.addChild('SeekButton', {
			direction: 'back',
			seconds: options.back || 30
		});
		if (playButton)
			player.controlBar.el().insertBefore(player.controlBar.seekBack.el(), playButton.el().nextSibling);
		else
			player.controlBar.el().prepend(player.controlBar.seekBack.el())
	}
};

const seekButtons = function (options) {
	this.ready(() => onPlayerReady(this, videojs.mergeOptions(defaults, options)));
	videojs.registerComponent('SeekButton', SeekButton);
};

registerPlugin('seekButtons', seekButtons);

export default seekButtons;