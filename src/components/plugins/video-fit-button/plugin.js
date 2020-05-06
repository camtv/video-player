import "./plugin.scss";
import videojs from "video.js";
import { mdiStretchToPage, mdiStretchToPageOutline } from "@mdi/js"

// VIDEO FIT
export const FitTypes = {
	COVER: 0,
	CONTAIN: 1,
}

export function SetCoverFit(VideoID) {
	// Forzo inizialmente la modalità cover
	videojs.getPlayer(VideoID).ready(function () {
		var myPlayer = this;
		fnToggleFit(myPlayer);
	});
}

export function AddFitButton(VideoID) {
	videojs.getPlayer(VideoID).ready(function () {
		var myPlayer = this;
		var controlBar = myPlayer.$(".vjs-control-bar");
		var insertBeforeNode = myPlayer.$(".vjs-fullscreen-control");

		var jqNewElement = $(`
				<button class="vjs-fit-control vjs-control vjs-button" type="button" title="Video fit" aria-disabled="false">
					${svg(mdiStretchToPage)}
					<span class="vjs-control-text" aria-live="polite">Video fit</span>
				</button>
			`);

		// Avoid duplicates
		if (controlBar.querySelector("vjs-fit-control") != null)
			return;

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
		jqBtn.find("svg").replaceWith($(svg(mdiStretchToPage)));
	}

	else if (myPlayer.currentFit == FitTypes.CONTAIN) {
		jqVideoContainer.removeClass("vjs-cover");
		jqVideoContainer.find("video").css({ "object-fit": "contain" });
		jqBtn.find("svg").replaceWith($(svg(mdiStretchToPageOutline)));
	}
}

function svg(path) {
	return `<svg viewBox="0 0 24 24"><path d="${path}"/></svg>`;
}