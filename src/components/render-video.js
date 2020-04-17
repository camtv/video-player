import PlayerManager from "./player-manager";

export default function RenderVideoCamTV({ id, ...options }) {
	const sVideoID = "CTV_VIDEO_" + id;

	$(`#${id}`).html(`<video-js id="${sVideoID}" data-embed="default" class="video-js ctvVideo" data-application-id controls playsinline></video-js>`);

	return new PlayerManager({ id: sVideoID, ...options });
}
