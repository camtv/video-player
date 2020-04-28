import videojs from "video.js"
import { getBookmark, createBookmark, removeBookmark, updateBookmark } from "./utilities";

const MIN_SECONDS_PLAYED = 1;
const Component = videojs.getComponent('Component');

class Overlay extends Component {
	constructor(player, options) {
		super(player, options);

		this.hide();

		let lastUpdate = new Date().getTime();

		player.on(['loadedmetadata'], () => this.checkBookmarks());
		player.on(['play', 'volumechange'], () => createBookmark(player));
		player.on(['ended'], () => removeBookmark(player.src()));
		player.on(['timeupdate'], () => {
			if (new Date().getTime() - lastUpdate < 1000)
				return;
			lastUpdate = new Date().getTime();
			createBookmark(player);
			updateBookmark(player.src(), player.currentTime());
		});
	}

	createEl() {
		const el = videojs.dom.createEl('div', {
			className: `vjs-bookmark-dialog vjs-hidden`,
			innerHTML: `
				<div>
					<p>Vuoi riprendere il video da dove lo avevi lasciato?</p>
					<div>
						<button class="confirm">SI</button>
						<button class="cancel">NO</button>
					<div>
				</div>
			`
		});

		return el;
	}

	show() {
		this.el().querySelector("button.confirm").addEventListener("click", () => this.resume());
		this.el().querySelector("button.cancel").addEventListener("click", () => this.restart());
		return super.show();
	}

	hide() {
		this.el().querySelector("button.confirm").removeEventListener("click", () => this.resume());
		this.el().querySelector("button.cancel").removeEventListener("click", () => this.restart());
		return super.hide();
	}

	checkBookmarks() {
		const player = this.player();
		const src = player.src();
		const bookmark = getBookmark(src);
		if (!bookmark || bookmark.seconds < MIN_SECONDS_PLAYED)
			return;

		// Stop playing and show modal
		player.autoplay(false);
		if (!player.paused())
			player.pause();

		this.show();
	}

	restart() {
		const player = this.player();
		player.play();
		this.hide();
	}

	resume() {
		const player = this.player();
		const src = player.src();
		const bookmark = getBookmark(src);

		player.currentTime(bookmark.seconds);
		player.play();

		this.hide();
	}
}

export default Overlay;