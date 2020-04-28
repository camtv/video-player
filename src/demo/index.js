import "./index.scss";
import { RenderVideoCamTV } from "../module";

// HLSmMulti track
var oVideoPlayer1 = RenderVideoCamTV({
	id: "my-custom-video-1",
	videoURL: "https://vodserver.cam.tv/vod/academy/trailers/ringraziamento_lancio_cerchia_,50,75,100,0k.mp4.urlset/playlist.m3u8?coming_soon",
	posterURL: "https://media.cam.tv/CID000016/video/VID0048A6/cover.jpg?t=1561462730",
	autoplay: "muted",
	controls: {
		rotation: true,
		videoFit: true,
	}
})
	.on("init", function () {
		console.log("initialized");
	})
	.on("pause", function () {
		console.log("pause");
	})
	.on("ended", function () {
		console.log("ended");
	})
	.on("timeupdate", function () {
		// console.log("timeupdate");
	})

// Overlay elements controls
var oVideoPlayer2 = RenderVideoCamTV({
	id: "my-custom-video-2",
	videoURL: "https://camtv.ams3.cdn.digitaloceanspaces.com/original/CID000016/video/VID0048A6",
	posterURL: "https://serviceslocalcam.3technology.it/CID000016/post/PID0476DE/cover.jpg?t=1587624959",
	overlays: [
		{
			content: '<span>The video is playing</span>',
			start: 'play',
			end: 'pause',
			class: "my-css-class overlayA",
			align: "bottom-right"
		},
		{
			content: '<span>The video is paused</span>',
			start: "pause",
			end: 'play',
			class: "my-css-class overlayE",
			align: "top"
		},
		{
			content: '<span>The video is ended</span>',
			start: "ended",
			end: "play",
			class: "my-css-class overlayD",
			align: "bottom-right"
		},
		{
			content: '<span>The video is 0-40</span>',
			start: 0,
			end: 40,
			class: "my-css-class overlayB",
			align: "top-left"
		},
		{
			content: '<span>The video is 15-30</span>',
			start: 15,
			end: 30,
			class: "my-css-class overlayC",
			align: "bottom-left"
		},
	]
});

// Small player with tracking
var oVideoPlayer3 = RenderVideoCamTV({
	id: "my-custom-video-3",
	videoURL: "https://camtv.ams3.cdn.digitaloceanspaces.com/original/CID000016/video/VID0048A6",
	posterURL: "https://media.cam.tv/CID000016/video/VID0048A6/cover.jpg?t=1561462730",
	tracking: true,
	controls: {
		small: true
	}
})
	.on("tracking", function (evt, data) {
		const { seconds, chunks } = data;
		console.log("tracking", seconds, chunks);
	});