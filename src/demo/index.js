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
		console.log("initialized!");
	})

// Normal controls
var oVideoPlayer2 = RenderVideoCamTV({
	id: "my-custom-video-2",
	videoURL: "https://camtv.ams3.cdn.digitaloceanspaces.com/original/CID000016/video/VID0048A6",
	posterURL: "https://serviceslocalcam.3technology.it/CID000016/post/PID0476DE/cover.jpg?t=1587624959",
	controls: {}
});

// Normal video hidden controls
var oVideoPlayer3 = RenderVideoCamTV({
	id: "my-custom-video-3",
	videoURL: "https://camtv.ams3.cdn.digitaloceanspaces.com/original/CID000016/video/VID0048A6",
	posterURL: "https://media.cam.tv/CID000016/video/VID0048A6/cover.jpg?t=1561462730",
	controls: {
		small: true
	}
});