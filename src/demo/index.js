import "./index.scss";
import { RenderVideoCamTV } from "../module";

var oVideoPlayer1 = RenderVideoCamTV({
	id: "my-custom-video-1",
	videoURL: "https://vodserver.cam.tv/vod/academy/trailers/ringraziamento_lancio_cerchia_,50,75,100,0k.mp4.urlset/playlist.m3u8?coming_soon",
	posterURL: "https://media.cam.tv/CID000016/video/VID0048A6/cover.jpg?t=1561462730",
	controls: {
		rotation: true,
		videoFit: true,
	}
});
oVideoPlayer1.on("init", function () {
	oVideoPlayer1.setMute(true);
	oVideoPlayer1.playVideo();
})

var oVideoPlayer2 = RenderVideoCamTV({
	id: "my-custom-video-2",
	videoURL: "https://camtv.ams3.cdn.digitaloceanspaces.com/original/CID000016/video/VID0048A6",
	posterURL: "https://media.cam.tv/CID000016/video/VID0048A6/cover.jpg?t=1561462730",
	controls: {}
});

var oVideoPlayer3 = RenderVideoCamTV({
	id: "my-custom-video-3",
	videoURL: "https://camtv.ams3.cdn.digitaloceanspaces.com/original/CID000016/video/VID0048A6",
	posterURL: "https://media.cam.tv/CID000016/video/VID0048A6/cover.jpg?t=1561462730",
	controls: {
		hide: true,
		small: true
	}
});