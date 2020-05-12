import videojs from "video.js";
import { mdiScreenRotation } from "@mdi/js";

// ROTATION
export function AddRotationButton(VideoID) {
	videojs.getPlayer(VideoID).ready(function () {
		var myPlayer = this;
		var controlBar = myPlayer.$(".vjs-control-bar");
		var insertBeforeNode = myPlayer.$(".vjs-fullscreen-control");

		var jqNewElement = $(`
				<button class="vjs-rotate-control vjs-control vjs-button" type="button" title="Rotate" aria-disabled="false" style="">
					<svg viewBox="0 0 24 24"><path d="${mdiScreenRotation}"/></svg>
					<span class="vjs-control-text" aria-live="polite" style="">Rotate</span>
				</button>
			`);

		// Avoid duplicates
		if (controlBar.querySelector("vjs-rotate-control") != null)
			return;

		controlBar.insertBefore(jqNewElement[0], insertBeforeNode);

		// +++ Add event handlers+++
		myPlayer.currentRotation = 0;
		jqNewElement.on("click", function (e) {
			e.stopPropagation();
			fnRotate(myPlayer);
			myPlayer.trigger("rotate");
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