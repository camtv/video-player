import "../translucent-buttons.scss";
import "./plugin.scss";
import videojs from 'video.js';
import { mdiReload } from "@mdi/js";
import icon from "../../../../assets/images/error-video-play-icon.svg";
// import background from "../../../../assets/images/video-error-bg.gif";

const defaults = {};

const registerPlugin = videojs.registerPlugin || videojs.plugin;

const onPlayerReady = (player, options) => {
	player.addClass('vjs-error-plugin');
};

const onErrorHandler = function (player, options) {
	let error = player.error();
	const content = document.createElement('div');

	// No error
	if (!error)
		return;

	// Setting the content
	content.id = 'vjs-errors-dialog';
	content.className = 'vjs-errors-dialog';
	content.innerHTML = `
		<div class="bg"></div>
		<div class="graphic">
			<img src="${icon}" />
		</div>
		<div class="error-message">
			<div>
				<h3>${player.localize("Ooops")}...</h3>
				<p class="Text">${player.localize("There was an error")}</p>
				${options.reinit ? `<button class="vjs-button vjs-translucent-button reload">
					<svg viewBox="0 0 24 24"><path d="${mdiReload}"/></svg>
					<span>${player.localize("Reload video")}</span>
				</button>` : ""}
			</div>
		</div>
	`;

	// Fill the original error message with content
	const display = player.getChild('errorDisplay');
	display.fillWith(content);

	// Removes error on close
	const onClick = () => {
		if (options.reinit) {
			player.error(null);
			options.reinit();
		}
	}

	const btn = display.$("button.reload");
	if (btn) {
		btn.removeEventListener("click", onClick)
		btn.addEventListener("click", onClick);
	}
}

const errorPlugin = function (options) {
	const mergedOptions = videojs.mergeOptions(defaults, options);
	// this.on('play', onPlayStartMonitor);
	this.on(['aderror', 'contenterror', 'error'], function () { onErrorHandler(this, mergedOptions); });
	this.ready(() => onPlayerReady(this, mergedOptions));
};

registerPlugin('errorPlugin', errorPlugin);

export default errorPlugin;

/// player.currentWidth() <= 600 || player.currentHeight() <= 250 vjs-xs