import videojs from "video.js";
import { mdiStretchToPage, mdiStretchToPageOutline } from "@mdi/js"
import { FitTypes } from "./config";

const Button = videojs.getComponent('Button');

export default class VideoFitButton extends Button {
	constructor(player, options) {
		super(player, options);

		this.player().currentFit = FitTypes.COVER;
		this.renderVideoFit();

		window.addEventListener("resize", () => this.renderButton());
		window.addEventListener("rotate", () => this.renderButton());
		player.on(['ready', 'rotate', 'resize'], () => this.renderButton());

		player.on(['fullscreenchange'], () => this.onFullscreenChange());
	}

	createEl(tag, props = {}, attributes = {}) {
		const { COVER, CONTAIN } = FitTypes;
		const { currentFit } = this.player();

		const icon = currentFit == COVER ? mdiStretchToPage : currentFit == CONTAIN ? mdiStretchToPageOutline : "";

		const el = super.createEl('button', {
			innerHTML: `<svg viewBox="0 0 24 24"><path d="${icon}"/></svg>`,
			...props
		}, attributes);

		this.createControlTextEl(el);

		return el;
	}

	buildCSSClass() {
		return `vjs-fit-control ${super.buildCSSClass()}`;
	}

	handleClick(event) {
		this.toggleFit();
		super.handleClick(event);
	}

	toggleFit() {
		const newState = this.player().currentFit === FitTypes.COVER ? FitTypes.CONTAIN : FitTypes.COVER;
		this.player().currentFit = newState;
		this.renderVideoFit();
		this.trigger("togglefit");
	}

	renderVideoFit() {
		const player = this.player();
		const svgPath = this.$("svg>path");
		const { currentFit } = player;

		// Video properties
		if (currentFit == FitTypes.COVER) {
			player.addClass("vjs-cover");
			player.$("video").style.objectFit = "cover";
			svgPath.setAttribute("d", mdiStretchToPage);
		}

		else if (currentFit == FitTypes.CONTAIN) {
			player.removeClass("vjs-cover");
			player.$("video").style.objectFit = "contain";
			svgPath.setAttribute("d", mdiStretchToPageOutline);
		}

		// Button properties
		this.renderButton();
	}

	renderButton() {
		/** @type {HTMLVideoElement} */
		const video = this.player().$("video");
		const { videoWidth, videoHeight, clientWidth, clientHeight } = video;

		const relativeHeight = videoWidth / clientWidth * clientHeight;
		const isSameFormFactor = videoHeight > 0 && Math.abs(videoHeight - relativeHeight) < 1; // 1px tolerance for subpixel devices

		if (isSameFormFactor)
			this.disable();
		else
			this.enable();
	}

	onFullscreenChange() {
		const { COVER, CONTAIN } = FitTypes;

		const player = this.player();
		const isFullscreen = player.isFullscreen();
		const currentFit = player.currentFit;

		// Remove cover mode if fullscreen
		if ((isFullscreen && currentFit == COVER) || (!isFullscreen && currentFit == CONTAIN))
			this.toggleFit();
		else
			this.renderVideoFit();
	}
}