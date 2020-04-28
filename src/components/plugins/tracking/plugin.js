import videojs from 'video.js';

const defaults = {};

const registerPlugin = videojs.registerPlugin || videojs.plugin;

const onPlayerReady = (player, options) => {
	let interval = null;
	let currentChunk = null;
	let viewChunks = []

	// On play start monitoring
	player.on("play", () => {
		currentChunk = {
			start: player.currentTime(),
			end: null,
		};

		// Updates current chunk infos and throws event
		interval = setInterval(() => {
			currentChunk.end = player.currentTime();
			const seconds = calculate(viewChunks, currentChunk);
			player.trigger("tracking", seconds);
		}, 1000);
	});

	// On pause stop monitoring
	player.on("pause", () => {
		if (interval) clearInterval(interval);
		currentChunk.end = player.currentTime();
		viewChunks.push(currentChunk);
		currentChunk = null;
		const seconds = calculate(viewChunks, currentChunk);
		player.trigger("tracking", seconds);
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
		values.push(currentChunk);

	if (values.length == 0)
		return;

	// Order by increasing start
	values = values.sort((a, b) => (a.start < b.start ? -1 : 1));

	// Evaluate chunks not overlapping
	const evaluatedChunks = [values[0]];
	values.forEach(x => {
		const last = evaluatedChunks[evaluatedChunks.length - 1]
		const isIntersecting = x.start <= last.end;
		if (isIntersecting)
			last.end = x.end;
		else
			evaluatedChunks.push(x);
	});

	// Sum
	const seconds = evaluatedChunks.reduce((sum, x) => sum + x.end - x.start, 0);

	return seconds;
}

const tracking = function (options) {
	this.ready(() => onPlayerReady(this, videojs.mergeOptions(defaults, options)));
};

registerPlugin('tracking', tracking);

export default tracking;