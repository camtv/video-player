import videojs from "video.js";
import iconForward30 from "../../../../assets/images/30-forward.svg";
import iconRewind30 from "../../../../assets/images/30-rewind.svg";

const Button = videojs.getComponent('Button');
const Component = videojs.getComponent('Component');

class SeekButton extends Button {
	constructor(player, options) {
		super(player, options);

		this.init();
	}

	init() {
		if (this.options_.direction === 'forward') {
			this.controlText(this.localize('Seek forward {{seconds}} seconds')
				.replace('{{seconds}}', this.options_.seconds));
		}
		else if (this.options_.direction === 'back') {
			this.controlText(this.localize('Seek back {{seconds}} seconds')
				.replace('{{seconds}}', this.options_.seconds));
		}
	}

	createEl(tag, props = {}, attributes = {}) {
		const svg = this.options_.direction == "forward" ? iconForward30 : iconRewind30;
		const el = Component.prototype.createEl.call(this, "button",
			{
				innerHTML: `
					<span aria-hidden="true" class="vjs-icon-placeholder">
						<img src="${svg}" />
					</span>
				`,
				className: this.buildCSSClass(),
				...props
			},
			{
				type: 'button',
				...attributes
			});

		this.createControlTextEl(el);

		return el;
	}

	buildCSSClass() {
		return `vjs-seek-button skip-${this.options_.direction} ${super.buildCSSClass()}`;
	}

	handleClick() {
		const now = this.player_.currentTime();

		if (this.options_.direction === 'forward') {
			this.player_.currentTime(now + this.options_.seconds);
		}
		else if (this.options_.direction === 'back') {
			this.player_.currentTime(now - this.options_.seconds);
		}
	}
}

export default SeekButton;
