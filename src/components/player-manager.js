import "video.js/dist/video-js.min.css"
import "./player-manager.scss";
import videojs from "video.js";
import "./plugins/vjs-http-source-selector/plugin";
import "./plugins/seek-buttons/plugin";
import EventsClass from "../libs/events-class";
import { AddRotationButton } from "./plugins/rotate-button/plugin";
import { FitTypes, SetCoverFit, AddFitButton } from "./plugins/video-fit-button/plugin";
import { setRequestHeaders, makeXHRequest } from "../libs/utilities";

/**
 * Creates a new instance of video player.
 * @param {object} options Video player configuration. It must include id of the video element and videoUrl
 */
export default class PlayerManager extends EventsClass {
	static FitTypes = FitTypes;

	constructor(options) {
		super();

		this.options = {
			id: null,
			videoURL: "",
			posterURL: "",
			headers: {
				"Authorization": null
			},
			controls: {
				hide: false,
				small: false,
				rotation: false,
				videoFit: false,
			},
			...options
		}

		this.player = null;

		this.init();
	}

	events = {
		"error": null,
		"init": null,
		"ready": null,
		"play": null,
		"pause": null,
		"ended": null,
		"buffering": null,
	}

	// Base
	init() {
		const { videoURL, headers } = this.options;

		setRequestHeaders(headers);

		checkVideoExists(videoURL)
			.then((url) => this._onSuccessCallback(url))
			.catch(() => this._throwError(6));
	}

	destroy = () => {
		if (this.player && this.player.dispose)
			this.player.dispose();
		this.removeEvents();
	}

	// Events
	addEvents = () => {
		if (this.eventsAdded)
			return;
		this.eventsAdded = true;

		this.player.ready(() => this.trigger("ready"));

		this.player.on("error", (evt) => {
			const mediaError = this.player.error();
			const iErrorCode = mediaError ? mediaError.code : 0;
			this.trigger("error", iErrorCode);
		});

		this.player.on("play", () => this.trigger("play"));

		this.player.on("pause", () => this.trigger("pause"));

		this.player.on("ended", () => this.trigger("ended"));

		this.player.on("buffering", () => this.trigger("buffering"));

		this.player.on("timeupdate", () => this.trigger("timeupdate"));
	}

	removeEvents = () => {
		this.eventsAdded = false;

		if (this.player)
			this.player.off();
	}

	// Public
	playVideo = (seconds = null) => {
		if (!this.player)
			return;

		this.player.play();

		if (seconds != null) {
			this.player.on('loadeddata', (e) => {
				this.player.currentTime(seconds)
			});
			this.player.currentTime(seconds)
		}
	}

	pauseVideo = () => {
		if (this.player != null)
			this.player.pause();
	}

	setMute = (toMute) => {
		if (this.player != null)
			this.player.muted(toMute);
	}

	getStateVideo = () => {
		if (this.player == null)
			return "not_ready";

		if (this.player.hasStarted_ == true && this.player.paused() == false && this.player.bufferedPercent() == 0)
			return "buffering";

		else if (this.player.hasStarted_ == true && this.player.paused() == false)
			return "playing";

		else if (this.player.hasStarted_ == true && this.player.paused() == true)
			return "paused";

		else if (this.player.ended())
			return "ended";

		return "not_ready";
	}

	getBufferPercent = () => {
		if (this.player == null || this.player.bufferedPercent == null)
			return 0;
		return this.player.bufferedPercent();
	}

	getVideoDuration = () => {
		if (this.player == null || this.player.bufferedPercent == null)
			return 0;
		return this.player.duration();
	}

	getVideoCurrentTime = () => {
		if (this.player == null || this.player.bufferedPercent == null)
			return 0;
		return this.player.currentTime();
	}

	getFullscreen = () => {
		if (this.player == null || this.player.isFullscreen == null)
			return false;

		return this.player.isFullscreen();
	}

	setFullscreen = (val) => {
		if (this.player == null || this.player.requestFullscreen == null || this.player.exitFullscreen == null)
			return false;

		if (val)
			this.player.requestFullscreen();
		else
			this.player.exitFullscreen();
	}

	// PRIVATE
	_onSuccessCallback(returnUrl) {
		try {
			const { id, posterURL, controls = {} } = this.options;
			const { hide, small, rotation, videoFit } = controls || {};

			// Init videojs player
			this.player = videojs(id, {
				controlBar: {
					pictureInPictureToggle: false,
					volumePanel: {
						inline: false,
						vertical: false
					},
					...controls
				}
			});

			// Set poster
			if (posterURL)
				this.player.poster(posterURL);

			// Hidden controls
			if (hide) {
				setHideControls(id);
			}
			// Visible controls
			else {
				this.player.seekButtons({ forward: 30, back: 30 });
				this.player.httpSourceSelector({ default: 'auto' });

				AddMuteButton(id);

				if (small)
					document.getElementById(id).parentNode.classList.add("small-controls");

				if (rotation)
					AddRotationButton(id);

				// Gestione cover/contain
				SetCoverFit(id);
				if (videoFit)
					AddFitButton(id);
			}

			// Sets player src
			this.player.src({
				src: returnUrl,
				type: returnUrl.indexOf(".m3u8") > -1 ? "application/x-mpegURL" : "video/mp4"
			});

			// Eventi collegati al player
			const clickfunction = (e) => {
				e.preventDefault();
				e.stopPropagation();
				if (this.player.el_.autoplayed) {
					this.player.el_.autoplayed = false;
					this.player.muted(false);
				}
				if (this.player.paused()) {
					this.player.play();
				} else
					this.player.pause();
			}

			this.player.tech_.off("touchend");
			this.player.tech_.off("touchstart");
			this.player.tech_.off("mouseup");
			this.player.tech_.off("mousedown");
			this.player.tech_.off("tap");
			this.player.tech_.off("click");
			this.player.tech_.on("mouseup", clickfunction);
			this.player.tech_.on('tap', clickfunction)

			this.player.bigPlayButton.off();
			this.player.bigPlayButton.on("mouseup", clickfunction);
			this.player.bigPlayButton.on("tap", clickfunction);

			// Init event
			this.trigger("init");
		}
		catch (ex) {
			console.error("_onSuccessCallback", ex);
		}
	}

	_throwError = (errorCode) => {
		const { id } = this.options;

		console.error("PlayerManager error. Error code: " + errorCode)
		this.trigger("error", errorCode);

		const videoEl = document.getElementById(id);
		if (videoEl)
			videoEl.classList.add("vjs-error");
	}
}


// XHR
function checkVideoExists(videoURL) {
	return new Promise((resolve, reject) => {
		if (videoURL == null || videoURL.trim() == "")
			return reject();

		if (videoURL.indexOf(".m3u8") > -1)
			return resolve(videoURL);

		makeXHRequest(videoURL)
			.then(() => resolve(videoURL))
			.catch((iStatusCode) => {
				if (iStatusCode != 401)
					return reject();

				// Se lo status code � 401 pu� essere un problema di CORS e quindi rieseguo la chiamata invalidando la cache dell'URL
				var sUncachedURL = videoURL + "?" + Math.random().toString(36).substring(7);
				makeXHRequest(sUncachedURL)
					.then(() => resolve(sUncachedURL))
					.catch(() => reject);
			});
	})
}


// CONTROLS
function AddMuteButton(VideoID) {
	videojs.getPlayer(VideoID).ready(function () {
		var myPlayer = this
		var button = myPlayer.addChild('button');
		button.addClass("vjs-mute-control");
		button.addClass("ctv-custom-control");
		button.handleClick = function () {
			myPlayer.muted(!myPlayer.muted());
			myPlayer.el_.autoplayed = false;
		};
		button.disable();
		button.enable();
	});
}

function setHideControls(VideoID) {
	videojs.getPlayer(VideoID).ready(function () {
		var myPlayer = this;
		myPlayer.el().parentNode.classList.add("hide-controls");

		var button = myPlayer.addChild('button');
		button.addClass("vjs-fullscreen-control");
		button.addClass("ctv-custom-control");
		button.handleClick = function () {
			if (!myPlayer.isFullscreen())
				myPlayer.requestFullscreen();
			else
				myPlayer.exitFullscreen();
		};
		button.disable();
		button.enable();
	});
}