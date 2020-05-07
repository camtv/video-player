import "./plugin.scss";
import videojs from 'video.js';
import BookmarkModal from './BookmarkModal';

const defaults = {};

const registerPlugin = videojs.registerPlugin || videojs.plugin;

const onPlayerReady = (player, options) => {
	if (!player.options().bookmarks)
		return;

	player.addClass('vjs-bookmarks');

	const controlBar = player.controlBar;

	player.bookmarkModal = player.addChild('BookmarkModal', { ...options });

	if (controlBar)
		player.el().insertBefore(player.bookmarkModal.el(), controlBar.el().nextSibling);
	else
		player.el().append(player.bookmarkModal.el())

};

const bookmarks = function (options) {
	this.ready(() => onPlayerReady(this, videojs.mergeOptions(defaults, options)));
	videojs.registerComponent('BookmarkModal', BookmarkModal);
};

registerPlugin('bookmarks', bookmarks);

export default bookmarks;