import "video.js/dist/video-js.min.css"
import "./player-manager.scss";
import videojs from "video.js";
import "./plugins/vjs-http-source-selector/plugin";
import "./plugins/seek-buttons/plugin";
import EventsClass from "../libs/events-class";

export default class PlayerManager extends EventsClass {
	static FitTypes = FitTypes;

	constructor(options) {
		super();

		this.options = {
			id: null,
			videoURL: "",
			posterURL: "",
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
		const { videoURL } = this.options;

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

		this.player.ready(() => this._throwEvent("ready"));

		this.player.on("error", (evt) => {
			const mediaError = this.player.error();
			const iErrorCode = mediaError ? mediaError.code : 0;
			this._throwEvent("error", iErrorCode);
		});

		this.player.on("play", () => this._throwEvent("play"));

		this.player.on("pause", () => this._throwEvent("pause"));

		this.player.on("ended", () => this._throwEvent("ended"));

		this.player.on("buffering", () => this._throwEvent("buffering"));

		this.player.on("timeupdate", () => this._throwEvent("timeupdate"));
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

			// In caso di successo eseguo il video dell'url che mi viene inviato (potrebbe essere un url con cache invalidata)var SKEY = getCookie("SKEY");
			if ("undefined" !== typeof getCookie) {
				var SKEY = window.getCookie("SKEY");
				videojs.Hls.xhr.beforeRequest = (opt) => {
					if (opt.headers)
						opt.headers["auth"] = SKEY;
				}
			}

			// Init videojs player
			this.player = videojs(id, {
				controlBar: {
					volumePanel: {
						inline: false,
						vertical: false
					}
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
				RemovePiPButton(id);

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
			const _type = returnUrl.indexOf(".m3u8") > -1 ? "application/x-mpegURL" : "video/mp4";
			this.player.src({
				src: returnUrl,
				type: _type
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
			this._throwEvent("init");
		}
		catch (ex) {
			console.error("_onSuccessCallback", ex);
		}
	}

	_throwEvent = (name, ...params) => {
		this.trigger(name, ...params);
	}

	_throwError = (errorCode) => {
		const { id } = this.options;

		console.error("PlayerManager error. Error code: " + errorCode)
		document.getElementById(id).classList.add("vjs-error");
		this.trigger("error", errorCode);
	}
}


// XHR
function makeXHRequest(url) {
	return new Promise((resolve, reject) => {
		var http = new XMLHttpRequest();

		http.open('HEAD', url);
		http.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
		http.setRequestHeader('cache-control', 'max-age=0');
		http.setRequestHeader('pragma', 'no-cache');

		http.onreadystatechange = () => {
			if (http.readyState == http.DONE || http.readyState == http.HEADERS_RECEIVED) {
				if (http.status >= 200 && http.status < 300)
					return resolve();
				reject(http.status);
			}
		}

		http.send();
	});
}

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

function RemovePiPButton(VideoID) {
	videojs.getPlayer(VideoID).ready(function () {
		var myPlayer = this;
		var btn = myPlayer.el_.getElementsByClassName("vjs-picture-in-picture-control")[0];
		if (btn) btn.remove();
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


// ROTATION
function AddRotationButton(VideoID) {
	videojs.getPlayer(VideoID).ready(function () {
		var myPlayer = this;
		var controlBar = myPlayer.$(".vjs-control-bar");
		var insertBeforeNode = myPlayer.$(".vjs-fullscreen-control");

		var jqNewElement = $(`
				<button class="vjs-rotate-control vjs-control vjs-button" type="button" title="Rotate" aria-disabled="false" style="">
					<i class="mdi mdi-screen-rotation" aria-hidden="true"></i>
					<span class="vjs-control-text" aria-live="polite" style="">Rotate</span>
				</button>
			`);

		controlBar.insertBefore(jqNewElement[0], insertBeforeNode);

		// +++ Add event handlers+++
		myPlayer.currentRotation = 0;
		jqNewElement.on("click", function (e) {
			e.stopPropagation();
			fnRotate(myPlayer);
		});

		myPlayer.on("fullscreenchange", function () {
			fnRenderVideoSize(myPlayer);
		});

		window.addEventListener("resize", function () {
			fnRenderVideoSize(myPlayer);
		});
	});
}

function fnRotate(myPlayer) {
	// Tengo il valore di 360 per fare un'animazione di rotaqzione completa
	var newVal = (myPlayer.currentRotation + 90) == 360 ? 360 : (myPlayer.currentRotation + 90) % 360;
	myPlayer.currentRotation = newVal;
	fnRenderVideoRotation(myPlayer);
}

function fnRenderVideoRotation(myPlayer) {
	var jqVideoContainer = $("#" + myPlayer.id());

	// Renderizzo l'elemento video
	jqVideoContainer.find("video")
		.css({
			"transition": "transform 0.3s ease",
			"transform": "rotateZ(" + myPlayer.currentRotation + "deg)"
		})
		.off("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd")
		.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", (evt) => {
			$(evt.currentTarget).css({ "transition": "none" });
			if (myPlayer.currentRotation !== 360)
				return;
			$(evt.currentTarget).css({ "transform": "rotateZ(0deg)" });
			myPlayer.currentRotation = 0;
		});

	// Determino la dimensione del rettangolo video
	fnRenderVideoSize(myPlayer);

	// Aggiungo la classe rotated
	const isRotated = myPlayer.currentRotation == 90 || myPlayer.currentRotation == 270;
	jqVideoContainer.toggleClass("vjs-rotated", isRotated);
}

function fnRenderVideoSize(myPlayer) {
	var jqVideoContainer = $("#" + myPlayer.id());
	var jqVideo = jqVideoContainer.find("video");
	var isRotated = myPlayer.currentRotation == 90 || myPlayer.currentRotation == 270;

	if (!jqVideoContainer[0])
		return;

	var { width, height } = jqVideoContainer[0].getBoundingClientRect();

	// Video landscape o portrait
	var { videoWidth = 0, videoHeight = 0 } = jqVideo[0] || {};
	if (videoWidth && videoHeight) {
		var isLandscape = videoWidth / videoHeight >= 1;
		jqVideoContainer
			.toggleClass("vjs-landscape", isLandscape)
			.toggleClass("vjs-portrait", !isLandscape)
	}

	// Gestioen altezza e larghezza
	if (!myPlayer.isFullscreen())
		jqVideo.css({
			"width": (isRotated ? height : width) + "px",
			"height": (isRotated ? width : height) + "px",
			"top": "unset",
			"left": "unset"
		});
	else
		jqVideo.css({
			"width": "",
			"height": "",
			"top": "",
			"left": ""
		});
}


// VIDEO FIT
const FitTypes = {
	COVER: 0,
	CONTAIN: 1,
}

function SetCoverFit(VideoID) {
	// Forzo inizialmente la modalità cover
	videojs.getPlayer(VideoID).ready(function () {
		var myPlayer = this;
		fnToggleFit(myPlayer);
	});
}

function AddFitButton(VideoID) {
	videojs.getPlayer(VideoID).ready(function () {
		var myPlayer = this;
		var controlBar = myPlayer.$(".vjs-control-bar");
		var insertBeforeNode = myPlayer.$(".vjs-fullscreen-control");

		var jqNewElement = $(`
				<button class="vjs-fit-control vjs-control vjs-button" type="button" title="Video fit" aria-disabled="false">
					<i class="mdi mdi-stretch-to-page" aria-hidden="true"></i>
					<span class="vjs-control-text" aria-live="polite">Video fit</span>
				</button>
			`);

		controlBar.insertBefore(jqNewElement[0], insertBeforeNode);

		// +++ Add event handlers+++
		jqNewElement.on("click", function (e) {
			e.stopPropagation();
			fnToggleFit(myPlayer);
		});

		myPlayer.on("fullscreenchange", function () {
			// Se è fullscreen tolgo la modalità cover, altrimenti la riaggiungo
			if (myPlayer.isFullscreen() && myPlayer.currentFit == FitTypes.COVER ||
				!myPlayer.isFullscreen() && myPlayer.currentFit == FitTypes.CONTAIN)
				fnToggleFit(myPlayer);
		});
	});
}

function fnToggleFit(myPlayer) {
	const newState = myPlayer.currentFit === FitTypes.COVER ? FitTypes.CONTAIN : FitTypes.COVER;
	myPlayer.currentFit = newState;
	fnRenderVideoFit(myPlayer);
}

function fnRenderVideoFit(myPlayer) {
	var jqVideoContainer = $("#" + myPlayer.id());
	var controlBar = myPlayer.$(".vjs-control-bar");
	var jqBtn = $(controlBar).find(".vjs-fit-control");

	if (myPlayer.currentFit == FitTypes.COVER) {
		jqVideoContainer.addClass("vjs-cover");
		jqVideoContainer.find("video").css({ "object-fit": "cover" });
		jqBtn.find("i").addClass("mdi-stretch-to-page").removeClass("mdi-stretch-to-page-outline");
	}

	else if (myPlayer.currentFit == FitTypes.CONTAIN) {
		jqVideoContainer.removeClass("vjs-cover");
		jqVideoContainer.find("video").css({ "object-fit": "contain" });
		jqBtn.find("i").removeClass("mdi-stretch-to-page").addClass("mdi-stretch-to-page-outline");
	}
}