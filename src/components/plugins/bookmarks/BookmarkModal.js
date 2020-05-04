import videojs from "video.js"
import { getBookmark, createBookmark, removeBookmark, updateBookmark } from "./utilities";

const MIN_SECONDS_PLAYED = 30;
const Component = videojs.getComponent('Component');

class Overlay extends Component {
	constructor(player, options) {
		super(player, options);

		this.hide();

		this.isCheckedBookmark = false;
		this.lastUpdate = new Date().getTime();

		player.on(['play'], () => this.checkBookmarks());
		player.on(['volumechange'], () => createBookmark(player));
		player.on(['ended'], () => removeBookmark(player.src()));
		player.on(['timeupdate'], () => this.updateBookmark());
	}

	createEl() {
		const el = videojs.dom.createEl('div', {
			className: `vjs-modal-dialog vjs-bookmark-dialog vjs-hidden`,
			innerHTML: `
				<button class="vjs-close-button vjs-control vjs-button cancel" type="button" aria-disabled="false" title="Close Modal Dialog">
					<span aria-hidden="true" class="vjs-icon-placeholder"></span>
					<span class="vjs-control-text" aria-live="polite">
						Close Modal Dialog
					</span>
				</button>
				<div class="vjs-modal-dialog-content" role="document">
					<p>${this.localize("Do you want to resume the video from where you left it?")}</p>
					<div>
						<button class="vjs-control vjs-button vjs-translucent-button confirm">${this.localize("Resume")}</button>
						<button class="vjs-control vjs-button vjs-translucent-button cancel">${this.localize("Cancel")}</button>
					</div>
				</div>
			`
		});

		return el;
	}

	show(seconds) {
		this.isCheckedBookmark = false;
		this.player().addClass("videojs-bookmark-dialog-open");
		this.el().querySelector("button.confirm").addEventListener("click", () => this.resume(seconds));
		this.el().querySelectorAll("button.cancel").forEach(x => x.addEventListener("click", () => this.start()));
		return super.show();
	}

	hide() {
		this.player().removeClass("videojs-bookmark-dialog-open");
		this.el().querySelector("button.confirm").removeEventListener("click", () => this.resume());
		this.el().querySelectorAll("button.cancel").forEach(x => x.removeEventListener("click", () => this.start()));
		return super.hide();
	}

	checkBookmarks() {
		if (this.isCheckedBookmark === true)
			return;
		this.isCheckedBookmark = true;

		const player = this.player();
		const src = player.src();
		const bookmark = getBookmark(src);
		if (!bookmark || bookmark.seconds < MIN_SECONDS_PLAYED)
			return;

		// Stop playing and show modal
		player.autoplay(false);
		if (!player.paused())
			player.pause();

		this.show(bookmark.seconds);
	}

	updateBookmark() {
		const player = this.player();
		if (!this.isCheckedBookmark || new Date().getTime() - this.lastUpdate < 1000)
			return;
		this.lastUpdate = new Date().getTime();
		createBookmark(player);
		updateBookmark(player.src(), player.currentTime());
	}

	start() {
		this.isCheckedBookmark = true;
		const player = this.player();
		removeBookmark(player.src());
		player.play();
		this.hide();
	}

	resume(seconds) {
		this.isCheckedBookmark = true;
		this.player().currentTime(seconds);
		this.start();
	}
}

export default Overlay;