import "./plugin.scss";
import videojs from 'video.js';
import { version as VERSION } from '../../../../package.json';
import Overlay from './Overlay';

const defaults = {
	align: 'top-left',
	class: '',
	content: '',
	debug: false,
	showBackground: true,
	attachToControlBar: false,
	overlays: [{
		start: 'playing',
		end: 'paused'
	}]
};

const registerPlugin = videojs.registerPlugin || videojs.plugin;

const plugin = function (options) {
	if (!options || !options.overlays || options.overlays.length == 0)
		return;

	const settings = videojs.mergeOptions(defaults, options);

	// De-initialize the plugin if it already has an array of overlays.
	if (Array.isArray(this.overlays_)) {
		this.overlays_.forEach(overlay => {
			this.removeChild(overlay);
			if (this.controlBar) {
				this.controlBar.removeChild(overlay);
			}
			overlay.dispose();
		});
	}

	const overlays = settings.overlays;

	// We don't want to keep the original array of overlay options around
	// because it doesn't make sense to pass it to each Overlay component.
	delete settings.overlays;

	this.overlays_ = overlays.map(o => {
		const mergeOptions = videojs.mergeOptions(settings, o);
		const attachToControlBar = typeof mergeOptions.attachToControlBar === 'string' || mergeOptions.attachToControlBar === true;

		if (!this.controls() || !this.controlBar) {
			return this.addChild('overlay', mergeOptions);
		}

		if (attachToControlBar && mergeOptions.align.indexOf('bottom') !== -1) {
			let referenceChild = this.controlBar.children()[0];

			if (this.controlBar.getChild(mergeOptions.attachToControlBar) !== undefined) {
				referenceChild = this.controlBar.getChild(mergeOptions.attachToControlBar);
			}

			if (referenceChild) {
				const controlBarChild = this.controlBar.addChild('overlay', mergeOptions);

				this.controlBar.el().insertBefore(
					controlBarChild.el(),
					referenceChild.el()
				);
				return controlBarChild;
			}
		}

		const playerChild = this.addChild('overlay', mergeOptions);

		this.el().insertBefore(
			playerChild.el(),
			this.controlBar.el()
		);
		return playerChild;
	});
};

plugin.VERSION = VERSION;

registerPlugin('overlay', plugin);
videojs.registerComponent('Overlay', Overlay);

export default plugin;