import { VideoJsPlayer } from "video.js";

const STORAGE_KEY = "videoPlayerBookmarks";
const UPDATE_STORAGE_MS = 1000; // Min frequence of updates in storage expressed in milliseconds
const MAX_BOOKMARKS = 100; // Max number of bookmarks in localstorage
const BOOKMARK_MIN_SECONDS = 30; // Min seconds played to save video in bookmarks. Below is not interesting.

// First value is most recent
let bookmarks = getFromStorage() || []; // [{ src: "", seconds: 0 }]


/**
 * Get bookmark infos or null otherwise for provided video src
 * @param {string} src video src
 */
export function getBookmark(src) {
	if (!src)
		return;
	return bookmarks.find(x => x.src === src);
}

/**
 * Create a bookmark
 * @param {VideoJsPlayer} player videojs player instance
 */
export function createBookmark(player) {
	if (!player || !player.src())
		return;

	const src = player.src();

	// Avoid recreating it
	if (getBookmark(src))
		return;

	const isPlaying = !player.paused();
	const isAutoplay = !!player.autoplay();
	const isMuted = player.muted();
	const isMinTime = player.currentTime() > BOOKMARK_MIN_SECONDS;

	// Deve essere in riproduzione
	// Non deve essere in autoplay o in muto (in pratica deve esserci stata un'interazione da parte dell'utente)
	if (isPlaying && isMinTime && (!isAutoplay || !isMuted)) {
		bookmarks = [
			{ src, seconds: 0 },
			...bookmarks.filter(x => x.src !== src).slice(0, MAX_BOOKMARKS - 1)
		];
		updateStorage();
	}
}

/**
 * Update bookmark seconds if existent
 * @param {string} src video src
 * @param {number} seconds video played seconds
 */
export function updateBookmark(src, seconds = 0) {
	if (!src)
		return;

	// Avoid updating if it doesn't exists
	if (!getBookmark(src))
		return;

	bookmarks = bookmarks.map(x => {
		if (x.src === src)
			x.seconds = seconds;
		return x;
	});

	updateStorage();
}

/**
 * Removes video from bookmarks, for example when it has been watched entirely
 * @param {string} src video src
 */
export function removeBookmark(src) {
	bookmarks = bookmarks.filter(x => x.src !== src);
	updateStorage();
}


function getFromStorage() {
	const items = localStorage.getItem(STORAGE_KEY);
	if (items) {
		try { return JSON.parse(items); }
		catch (ex) { }
	}
	return [];
}

let timeout = null;
function updateStorage() {
	clearTimeout(timeout)
	timeout = setTimeout(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
	}, UPDATE_STORAGE_MS);
}
