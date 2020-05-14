import videojs from 'video.js';

const defaults = {};

const registerPlugin = videojs.registerPlugin || videojs.plugin;

const Plugin = videojs.getPlugin('plugin');

class Tracking extends Plugin {
	constructor(player, options) {
		super(player, options);

		this.player = player;

		this.interval = null;
		this.currentChunk = null;
		this.viewChunks = []

		player.on("play", () => this.onPlay());
		player.on("pause", () => this.onPause());
	}

	dispose() {
		this.stopCollecting();
		super.dispose();
	}

	onPlay() {
		this.stopCollecting();
		this.startCollecting();

		// Updates current chunk infos and throws event
		this.interval = setInterval(() => {
			// Rewind
			if (this.currentChunk.end > this.player.currentTime()) {
				this.stopCollecting();
				this.startCollecting();
			}
			else
				this.currentChunk.end = this.player.currentTime();
			this.handleData();
		}, 1000);
	}

	onPause() {
		this.stopCollecting();
		this.handleData();
	}

	startCollecting() {
		this.currentChunk = null;
		this.currentChunk = {
			start: this.player.currentTime(),
			end: null
		}
	}

	stopCollecting() {
		if (this.interval) clearInterval(this.interval);
		if (!this.currentChunk || !this.currentChunk.end)
			return;
		this.viewChunks.push({ ...this.currentChunk });
		this.currentChunk = null;
	}

	handleData() {
		const [seconds, chunks] = calculate(this.viewChunks, this.currentChunk);
		this.player.trigger("tracking", { seconds, chunks });
	}
}

/**
 * Calculate the effective amount of time that as been viewed. Bypassing backwards and replays.
 * @param {array} viewChunks 
 * @param {object} currentChunk 
 */
function calculate(viewChunks, currentChunk) {
	// Getting all chunks
	let values = [...viewChunks]
	if (currentChunk)
		values.push({ ...currentChunk });

	if (values.length == 0)
		return [0, []];

	// Order by increasing start
	values = values.sort((a, b) => (a.start < b.start ? -1 : 1));

	// Evaluate chunks not overlapping
	const evaluatedChunks = [...values].slice(0, 1);
	values.forEach(x => {
		const last = evaluatedChunks[evaluatedChunks.length - 1]
		const isIntersecting = x.start <= last.end && x.end > last.end;
		const isInner = x.start >= last.start && x.end <= last.end;
		if (isIntersecting)
			evaluatedChunks.push({ start: last.end, end: x.end });
		else if (!isInner)
			evaluatedChunks.push(x);
	});

	// Sum
	const seconds = parseInt(evaluatedChunks.reduce((sum, x) => sum + x.end - x.start, 0));

	return [seconds, values];
}

registerPlugin('tracking', Tracking);

export default Tracking;