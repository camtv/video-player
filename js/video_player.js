// IMPORTANTE!
// COMPILARE PRIMA CON BABEL PER GARANTIRE SUPPORTO SUI BROWSER VECCHI: https://babeljs.io/repl
// MINIFIZZARE IN SEGUITO CON: https://javascript-minifier.com/
(function () {
	const videojs = window["videojs"];

	// PUBLIC
	window.RenderVideoCamTV = function ({ id, ...options }) {
		var sVideoID = "CTV_VIDEO_" + id;
		$(`#${id}`).html(`<video-js id="${sVideoID}" data-embed="default" class="video-js ctvVideo" data-application-id controls playsinline></video-js>`);
		return new PlayerManager({ id: sVideoID, ...options });
	}

	window.PlayerManager = function (options) {
		const { id, videoURL, posterURL, fnOnInit, HideControls, SmallControls, ShowRotation, ShowVideoFit } = options;

		var ThisObj = this;
		ThisObj.player = null;

		// Variabili pubbliche
		ThisObj.eventListeners = {
			"onready": null,
			"onerror": null,
			"onplay": null,
			"onpause": null,
			"onended": null,
			"onbuffering": null,
		};

		ThisObj.destroy = function () {
			if (ThisObj.player && ThisObj.player.dispose)
				ThisObj.player.dispose();
			ThisObj.removeEvents();
		}

		// Funzioni pubbliche
		ThisObj.playVideo = function (PositionInSeconds) {
			if (ThisObj.player != null) {
				ThisObj.player.play();

				if (PositionInSeconds != null) {
					// TK: FRANCESCO - CTBT-1058 START
					ThisObj.player.on('loadeddata', function (e) {
						ThisObj.player.currentTime(PositionInSeconds)
					});
					ThisObj.player.currentTime(PositionInSeconds)
					// TK: FRANCESCO - CTBT-1058 END
				}

			}
		}

		ThisObj.pauseVideo = function () {
			if (ThisObj.player != null)
				ThisObj.player.pause();
		}

		ThisObj.setMute = function (toMute) {
			if (ThisObj.player != null)
				ThisObj.player.muted(toMute);
		}

		ThisObj.getStateVideo = function () {
			if (ThisObj.player == null)
				return "not_ready";

			if (ThisObj.player.hasStarted_ == true && ThisObj.player.paused() == false && ThisObj.player.bufferedPercent() == 0)
				return "buffering";

			else if (ThisObj.player.hasStarted_ == true && ThisObj.player.paused() == false)
				return "playing";

			else if (ThisObj.player.hasStarted_ == true && ThisObj.player.paused() == true)
				return "paused";

			else if (ThisObj.player.ended())
				return "ended";

			return "not_ready";
		}

		ThisObj.getBufferPercent = function () {
			if (ThisObj.player == null || ThisObj.player.bufferedPercent == null)
				return 0;
			return ThisObj.player.bufferedPercent();
		}

		ThisObj.getVideoDuration = function () {
			if (ThisObj.player == null || ThisObj.player.bufferedPercent == null)
				return 0;
			return ThisObj.player.duration();
		}

		ThisObj.getVideoCurrentTime = function () {
			if (ThisObj.player == null || ThisObj.player.bufferedPercent == null)
				return 0;
			return ThisObj.player.currentTime();
		}

		function checkVideoExists(videoURL, fnSuccess, fnFail) {
			if (videoURL == null || videoURL.trim() == "")
				return fnFail();

			if (videoURL.indexOf(".m3u8") > -1)
				return fnSuccess(videoURL);
			else
				makeXHRequest(videoURL,
					function () {
						fnSuccess(videoURL);
					},
					function (iStatusCode) {
						if (iStatusCode != 401)
							return fnFail();

						// Se lo status code � 401 pu� essere un problema di CORS e quindi rieseguo la chiamata invalidando la cache dell'URL
						var sUncachedURL = videoURL + "?" + Math.random().toString(36).substring(7);
						makeXHRequest(sUncachedURL,
							function () { fnSuccess(sUncachedURL); },
							function () { fnFail(); });
					});
		}

		function makeXHRequest(url, fnSuccess, fnFail) {
			var http = new XMLHttpRequest();
			http.open('HEAD', url);
			http.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
			http.setRequestHeader('cache-control', 'max-age=0');
			http.setRequestHeader('pragma', 'no-cache');
			http.onreadystatechange = function () {
				if (this.readyState == this.DONE) {
					if (this.status >= 200 && this.status < 300)
						return fnSuccess();
					fnFail(this.status);
				}
			}
			http.send();
		}

		// TK: FRANCESCO - CTBT-882 START
		ThisObj.getFullscreen = function () {
			if (ThisObj.player == null || ThisObj.player.isFullscreen == null)
				return false;

			return ThisObj.player.isFullscreen();
		}

		ThisObj.setFullscreen = function (val) {
			if (ThisObj.player == null || ThisObj.player.requestFullscreen == null || ThisObj.player.exitFullscreen == null)
				return false;

			if (val)
				ThisObj.player.requestFullscreen();
			else
				ThisObj.player.exitFullscreen();
		}
		// TK: FRANCESCO - CTBT-882 END
		ThisObj.eventsAdded = false;
		ThisObj.addEvents = function () {

			if (ThisObj.eventsAdded)
				return;

			ThisObj.eventsAdded = true;

			if (typeof ThisObj.eventListeners.onready == "function")
				ThisObj.player.ready(ThisObj.eventListeners.onready);

			ThisObj.player.on("error", function (evt) {
				var mediaError = ThisObj.player.error();
				var iErrorCode = mediaError ? mediaError.code : 0;
				if (typeof ThisObj.eventListeners.onerror == "function")
					ThisObj.eventListeners.onerror(iErrorCode);
			});

			ThisObj.player.on("play", function () {
				if (typeof ThisObj.eventListeners.onplay == "function")
					ThisObj.eventListeners.onplay();
			});

			ThisObj.player.on("pause", function () {
				if (typeof ThisObj.eventListeners.onpause == "function")
					ThisObj.eventListeners.onpause();
			});

			ThisObj.player.on("ended", function () {
				if (typeof ThisObj.eventListeners.onended == "function")
					ThisObj.eventListeners.onended();
			});

			ThisObj.player.on("buffering", function () {
				if (typeof ThisObj.eventListeners.onbuffering == "function")
					ThisObj.eventListeners.onbuffering();
			});

			ThisObj.player.on("timeupdate", function () {
				if (typeof ThisObj.eventListeners.ontimeupdate == "function")
					ThisObj.eventListeners.ontimeupdate();
			});
		}

		ThisObj.removeEvents = function () {
			ThisObj.eventsAdded = false;

			if (ThisObj.player)
				ThisObj.player.off();
		}

		// Controllo se il video esiste e in caso creo il player
		function fnOnSuccess(returnUrl) {
			// In caso di successo eseguo il video dell'url che mi viene inviato (potrebbe essere un url con cache invalidata)var SKEY = getCookie("SKEY");
			if ("undefined" !== typeof getCookie) {
				var SKEY = window.getCookie("SKEY");
				videojs.Hls.xhr.beforeRequest = function (opt) {
					if (opt.headers)
						opt.headers["auth"] = SKEY;
				}
			}

			let options = {
				controlBar: {
					volumePanel: {
						inline: false,
						vertical: false
					}
				}
			};

			ThisObj.player = videojs(id, options)
			if (posterURL)
				ThisObj.player.poster(posterURL);

			AddMuteButton(id);
			// AddAudioOnlyButton(id);
			if (SmallControls)
				document.getElementById(id).parentNode.classList.add("small-controls");

			if (ShowRotation)
				AddRotationButton(id);

			// Gestione cover/contain
			SetCoverFit(id);
			if (ShowVideoFit)
				AddFitButton(id);

			if (HideControls) {
				setHideControls(id);
			} else {
				SetRewindForwardButtons(id);
				RemovePiPButton(id);
			}

			if (typeof fnOnInit === "function")
				setTimeout(() => {
					fnOnInit();
				}, 0);
			let _type = "video/mp4";
			if (returnUrl.indexOf(".m3u8") > -1) _type = "application/x-mpegURL";
			ThisObj.player.src({
				src: returnUrl,
				type: _type
			});



			function clickfunction(e) {
				e.preventDefault();
				e.stopPropagation();
				if (ThisObj.player.el_.autoplayed) {
					ThisObj.player.el_.autoplayed = false;
					ThisObj.player.muted(false);
				}
				if (ThisObj.player.paused()) {
					ThisObj.player.play();
				} else
					ThisObj.player.pause();
			}

			ThisObj.player.tech_.off("touchend");
			ThisObj.player.tech_.off("touchstart");
			ThisObj.player.tech_.off("mouseup");
			ThisObj.player.tech_.off("mousedown");
			ThisObj.player.tech_.off("tap");
			ThisObj.player.tech_.off("click");
			ThisObj.player.tech_.on("mouseup", clickfunction);
			ThisObj.player.tech_.on('tap', clickfunction)

			ThisObj.player.bigPlayButton.off();
			ThisObj.player.bigPlayButton.on("mouseup", clickfunction);
			ThisObj.player.bigPlayButton.on("tap", clickfunction);
		}

		function fnOnFail() {
			document.getElementById(id).classList.add("vjs-error");
			if (typeof ThisObj.eventListeners.onerror == "function")
				ThisObj.eventListeners.onerror(6); // MEDIA_ERROR_NOT_FOUND
		}

		checkVideoExists(videoURL, fnOnSuccess, fnOnFail);

		return ThisObj;
	}

	// PRIVETE
	function SetRewindForwardButtons(VideoID) {
		videojs.getPlayer(VideoID).ready(function () {
			// +++ Create divs for buttons +++
			var myPlayer = this,
				jumpAmount = 30,
				controlBar,
				insertBeforeNode,
				newElementBB = document.createElement("div"),
				newElementFB = document.createElement("div");

			newElementBB.setAttribute("class", "vjs-control ctv-custom-btn");
			newElementBB.style["background-image"] = "url(https://www.cam.tv/assets/images/video-player/30-rewind.svg)";
			newElementFB.setAttribute("class", "vjs-control ctv-custom-btn");
			newElementFB.style["background-image"] = "url(https://www.cam.tv/assets/images/video-player/30-forward.svg)";

			// +++ Get controlbar and insert elements +++
			controlBar = myPlayer.$(".vjs-control-bar");
			// Get the element to insert buttons in front of in conrolbar
			insertBeforeNode = myPlayer.$(".vjs-volume-panel");

			// Insert the button div in proper location
			controlBar.insertBefore(newElementBB, insertBeforeNode);
			controlBar.insertBefore(newElementFB, insertBeforeNode);

			// +++ Add event handlers to jump back or forward +++
			// Back button logic, don't jump to negative times
			newElementBB.addEventListener("click", function (e) {
				e.stopPropagation();
				var newTime,
					rewindAmt = jumpAmount,
					videoTime = myPlayer.currentTime();
				if (videoTime >= rewindAmt) {
					newTime = videoTime - rewindAmt;
				} else {
					newTime = 0;
				}
				myPlayer.currentTime(newTime);
			});

			// Forward button logic, don't jump past the duration
			newElementFB.addEventListener("click", function (e) {
				e.stopPropagation();
				var newTime,
					forwardAmt = jumpAmount,
					videoTime = myPlayer.currentTime(),
					videoDuration = myPlayer.duration();
				if (videoTime + forwardAmt <= videoDuration) {
					newTime = videoTime + forwardAmt;
				} else {
					newTime = videoDuration;
				}
				myPlayer.currentTime(newTime);
			});
		});
	}

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

	function AddAudioOnlyButton(VideoID) {
		videojs.getPlayer(VideoID).ready(function () {
			var myPlayer = this
			var button = myPlayer.addChild('button');
			button.addClass("ctv-custom-control");
			button.addClass("ctv-audio-only-control");
			button.handleClick = function () {
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
		var isRotated = myPlayer.currentRotation == 90 || myPlayer.currentRotation == 270;
		var { width, height } = jqVideoContainer[0].getBoundingClientRect();

		if (!myPlayer.isFullscreen())
			jqVideoContainer.find("video").css({
				"width": (isRotated ? height : width) + "px",
				"height": (isRotated ? width : height) + "px",
				"top": "unset",
				"left": "unset"
			});
		else
			jqVideoContainer.find("video").css({
				"width": "",
				"height": "",
				"top": "",
				"left": ""
			});
	}


	// Video fit
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
})();