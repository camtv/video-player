import videojs from "video.js";

const MuteToggle = videojs.getComponent('MuteToggle');
const Component = videojs.getComponent('Component');

class FloatAudioButton extends MuteToggle {
	constructor(player, options) {
		super(player, options);
	}

	createEl(tag, props = {}, attributes = {}) {
		const options = this.player().options().floatingControls && this.player().options().floatingControls.audioToggle;
		const { html } = options;
		const el = Component.prototype.createEl.call(this, "button",
			{
				innerHTML: html || `<span aria-hidden="true" class="vjs-icon-placeholder"></span>`,
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
		return `vjs-float-button vjs-float-audio-button ${super.buildCSSClass()}`;
	}

	handleClick(event) {
		const options = this.player().options().floatingControls && this.player().options().floatingControls.audioToggle;
		const isMuted = this.player().muted();

		super.handleClick(event);

		if (isMuted && options.restart)
			this.player().currentTime(0);
	}
}

export default FloatAudioButton;
