import videojs from 'video.js';
const MenuItem = videojs.getComponent('MenuItem');
const Component = videojs.getComponent('Component');

class SourceMenuItem extends MenuItem {
	constructor(player, options) {
		options.selectable = true;
		options.multiSelectable = false;

		super(player, options);

		this.onClick = options.onClick;
	}

	createEl(type, props, attrs) {
		// The control is textual, not just an icon
		this.nonIconControl = true;

		return super.createEl('li', {
			className: 'vjs-menu-item',
			innerHTML: `
				<span class="vjs-menu-item-text">
					<span class="vjs-menu-item-circle"></span>
					${this.options_.label}
				</span>
			`,
			tabIndex: -1,
			...props
		}, attrs);
	}

	handleClick() {
		var selected = this.options_;

		this.player().selectedLevel = selected.label === "Auto" ? "auto" : selected.index;

		super.handleClick();
		this.enableQualityLevel(selected.index);
	}

	enableQualityLevel(index) {
		var levels = this.player().qualityLevels();
		var isAuto = index == levels.length;

		for (var i = 0; i < levels.length; i++) {
			if (isAuto || index == i) {
				levels[i].enabled = true;
			} else {
				levels[i].enabled = false;
			}
		}

		levels.trigger('change');
	}
}

Component.registerComponent('SourceMenuItem', SourceMenuItem);
export default SourceMenuItem;
