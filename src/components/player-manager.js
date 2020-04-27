import "video.js/dist/video-js.css"
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

		// See videojs options at: https://docs.videojs.com/tutorial-options.html
		this.options = {
			id: null,
			videoURL: "",
			posterURL: "",
			autoplay: false, // mettendo "muted" funziona maggiormente l'autoplay
			muted: false,
			preload: "auto", // "auto", "metadata", "none"
			small: false,
			...options,
			headers: {
				"Authorization": null,
				...options.headers
			},
			controls: {
				playToggle: true,
				seekButtons: {
					forward: 30,
					back: 30
				},
				volumePanel: {
					inline: false,
					vertical: false
				},
				currentTimeDisplay: true,
				timeDivider: true,
				durationDisplay: true,
				rotation: false,
				videoFit: true,
				sourceMenu: true,
				fullscreenToggle: true,
				pictureInPictureToggle: false,
				...options.controls
			},
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

		this.player.on("fullscreenchange", () => {
			this._keepPlayingOnFullscreenToggle();
		});
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
			const { id, posterURL, controls = {}, ...videojsOptions } = this.options;
			const { small, rotation, videoFit } = controls || {};

			// Init videojs player
			this.player = videojs(id, {
				...videojsOptions,
				controlBar: controls
			});

			// Set poster
			if (posterURL)
				this.player.poster(posterURL);

			// Small interface
			if (small)
				document.getElementById(id).parentNode.classList.add("small-controls");

			// Set controls options
			this.player.seekButtons(controls.seekButtons);
			this.player.httpSourceSelector({ default: 'auto' });

			AddMuteButton(id);

			if (rotation)
				AddRotationButton(id);

			// Gestione cover/contain
			SetCoverFit(id);
			if (videoFit)
				AddFitButton(id);

			// Sets player src
			this.player.src({
				src: returnUrl,
				type: returnUrl.indexOf(".m3u8") > -1 ? "application/x-mpegURL" : "video/mp4"
			});

			// Eventi collegati al player
			const clickfunction = (e) => {
				e.preventDefault();
				e.stopPropagation();

				this.player.off("play", this._onePause);
				this.player.off("pause", this._onePlay);

				const isPaused = this.player.paused();
				const isAutoplay = this.player.el_.autoplayed;

				// Se è muto tolgo il muto
				if (isAutoplay) {
					this.player.el_.autoplayed = false;
					this.player.muted(false);
				}

				// Se è in pausa lo faccio partire
				if (isPaused) {
					this.player.play();
				}
				// Se è in riproduzione
				else
					this.player.pause();
			}

			this.player.tech_.off("touchend");
			this.player.tech_.off("touchstart");
			this.player.tech_.off("mouseup");
			this.player.tech_.off("mousedown");
			this.player.tech_.off("tap");
			this.player.tech_.off("click");
			this.player.tech_.on("click", clickfunction);

			this.player.bigPlayButton.off();
			this.player.bigPlayButton.on("click", clickfunction);

			// Init event
			this.trigger("init");
		}
		catch (ex) {
			console.error("_onSuccessCallback", ex);
		}
	}

	_onePause() {
		this.player.off("play", this._onePause);
		this.player.off("pause", this._onePlay);
		this.player.pause();
	}

	_onePlay() {
		if (!this.player.off)
			return;
		this.player.off("play", this._onePause);
		this.player.off("pause", this._onePlay);
		this.player.play();
	}

	_keepPlayingOnFullscreenToggle() {
		const isFullscreen = this.player.isFullscreen();

		this.player.off("play", this._onePause);
		this.player.off("pause", this._onePlay);

		if (this.player.paused()) {
			if (!isFullscreen)
				this.player.on("play", this._onePause);
		}
		else {
			this.player.on("pause", this._onePlay);
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