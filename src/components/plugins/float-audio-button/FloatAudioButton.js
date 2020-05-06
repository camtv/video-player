import videojs from "video.js";

const MuteToggle = videojs.getComponent('MuteToggle');
const Component = videojs.getComponent('Component');

class FloatAudioButton extends MuteToggle {
	constructor(player, options) {
		super(player, options);

		const opts = player.options().floatingControls && player.options().floatingControls.audioToggle;
		this.restartOnUnmute = opts.restart;

		if (this.restartOnUnmute)
			player.on(['volumechange'], () => !this.player().muted() && this.hide());
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
		const isMuted = this.player().muted();
		const hidden = !isMuted && this.restartOnUnmute ? "vjs-hidden" : "";
		return `vjs-float-button vjs-float-audio-button ${hidden} ${super.buildCSSClass()}`;
	}

	handleClick(event) {
		const isMuted = this.player().muted();

		super.handleClick(event);

		if (isMuted && this.restartOnUnmute)
			this.player().currentTime(0);
	}
}

export default FloatAudioButton;
