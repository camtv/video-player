import videojs from 'video.js';
import SourceMenuItem from './SourceMenuItem';

const MenuButton = videojs.getComponent('MenuButton');

class SourceMenuButton extends MenuButton {
	constructor(player, options) {
		super(player, options);

		this.init(options);
	}

	get selectedLevel() {
		var iLev = this.player().selectedLevel;
		return iLev == null ? "auto" : iLev;
	}
	set selectedLevel(val) {
		this.player().selectedLevel = val;
	}

	init(options) {
		const player = this.player();
		var qualityLevels = player.qualityLevels();

		// Control text
		this.controlText(this.localize('Change video quality'));

		// Handle default options: auto, high, low.
		if (options && options.default) {
			for (var i = 0; i < qualityLevels.length; i++) {
				if (options.default == 'low') {
					qualityLevels[i].enabled = (i == 0);
					this.selectedLevel = i;
				}
				else if (options.default == 'high') {
					qualityLevels[i].enabled = (i == (qualityLevels.length - 1));
					this.selectedLevel = i;
				}
				else {
					qualityLevels[i].enabled = true;
					this.selectedLevel = "auto";
				}
			}
		}

		player.qualityLevels().on(['change', 'addqualitylevel'], videojs.bind(this, this.update));
	}

	createEl() {
		return videojs.dom.createEl('div', {
			className: 'vjs-http-source-selector vjs-menu-button vjs-menu-button-popup vjs-control vjs-button'
		});
	}

	buildCSSClass() {
		return super.buildCSSClass() + ' vjs-icon-cog';
	}

	update() {
		return super.update();
	}

	createItems() {
		var menuItems = [];
		var levels = this.player().qualityLevels();
		var labels = [];

		// Creates a menu item for each source quality
		for (var i = 0; i < levels.length; i++) {
			var index = levels.length - (i + 1);
			var selected = this.selectedLevel === index;

			// Display video height if height metadata is provided with the stream, else use bitrate
			var label = `${index}`;
			var sortVal = index;
			if (levels[index].height) {
				label = `${levels[index].height}p`;
				sortVal = parseInt(levels[index].height, 10)
			} else if (levels[index].bitrate) {
				label = `${Math.floor(levels[index].bitrate / 1e3)} kbps`;
				sortVal = parseInt(levels[index].bitrate, 10)
			}

			// Skip duplicate labels
			if (labels.indexOf(label) >= 0) {
				continue
			}
			labels.push(label);

			menuItems.push(new SourceMenuItem(this.player_, { label, index, selected, sortVal, onClick: this.update }));
		}

		// If there are multiple quality levels, offer an 'auto' option
		if (levels.length > 1) {
			menuItems.push(new SourceMenuItem(this.player_, { label: 'Auto', index: levels.length, selected: this.selectedLevel === "auto", sortVal: 99999, onClick: this.update }));
		}

		// Sort menu items by their label name with Auto always first
		menuItems.sort(function (a, b) {
			if (a.options_.sortVal < b.options_.sortVal) {
				return 1;
			} else if (a.options_.sortVal > b.options_.sortVal) {
				return -1;
			} else {
				return 0;
			}
		});

		return menuItems;
	}
}

export default SourceMenuButton;
