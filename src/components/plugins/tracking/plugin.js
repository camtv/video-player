import videojs from 'video.js';

const defaults = {};

const registerPlugin = videojs.registerPlugin || videojs.plugin;

const onPlayerReady = (player, options) => {
	// if (!player.options().tracking)
	// 	return;

	let interval = null;
	let currentChunk = null;
	let viewChunks = []

	const startCollecting = () => {
		currentChunk = null;
		currentChunk = {
			start: player.currentTime(),
			end: null
		}
	}

	const stopCollecting = () => {
		if (interval) clearInterval(interval);
		if (!currentChunk || !currentChunk.end)
			return;
		viewChunks.push({ ...currentChunk });
		currentChunk = null;
	}

	const handleData = () => {
		const [seconds, chunks] = calculate(viewChunks, currentChunk);
		player.trigger("tracking", { seconds, chunks });
	}

	// On play start monitoring
	player.on("play", () => {
		stopCollecting();
		startCollecting();

		// Updates current chunk infos and throws event
		interval = setInterval(() => {
			// Rewind
			if (currentChunk.end > player.currentTime()) {
				stopCollecting();
				startCollecting();
			}
			else
				currentChunk.end = player.currentTime();
			handleData();
		}, 1000);
	});

	// On pause stop monitoring
	player.on("pause", () => {
		stopCollecting();
		handleData();
	});
};

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

const tracking = function (options) {
	this.ready(() => onPlayerReady(this, videojs.mergeOptions(defaults, options)));
};

registerPlugin('tracking', tracking);

export default tracking;