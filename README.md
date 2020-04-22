<h1 align='center'>
  Cam.TV Video Player
</h1>

<p align='center'>
  A video player component for playing a variety of URLs, including HLS and YouTube. It can be installed via NPM or as a standalone library.
</p>

### Usage

#### Installation through NPM

```bash
npm install @camtv/video-player --save
```

```js
import { RenderVideoCamTV, PlayerManager } from "@camtv/video-player";

const player = RenderVideoCamTV({
	id: "my-container-id",
	videoURL: "https://camtv.ams3.cdn.digitaloceanspaces.com/original/CID000016/video/VID0048A6",
	posterURL: "https://media.cam.tv/CID000016/video/VID0048A6/cover.jpg?t=1561462730",
	// ...other options
});
player.on("init", () => {
	player.setMute(true);
	player.playVideo();
});
```

#### Installation as Standalone

```html
<script src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>
<script src="video-player.standalone.min.js"></script>
<link href="video-player.standalone.min.css" rel="stylesheet" />

<script>
	var player = RenderVideoCamTV({
		id: "my-container-id",
		videoURL: "https://camtv.ams3.cdn.digitaloceanspaces.com/original/CID000016/video/VID0048A6",
		posterURL: "https://media.cam.tv/CID000016/video/VID0048A6/cover.jpg?t=1561462730",
		// ...other options
	});
	player.on("init", () => {
		player.setMute(true);
		player.playVideo();
	});
</script>
```

#### Configuration

The player can be configured with an object, as you can see below

```js
var player = RenderVideoCamTV({
	id: "",
	videoURL: "",
	posterURL: "",
	headers: {
		Authorization: "Bearer xxxxx",
	},
	controls: {
		hide: false,
		small: false,
		rotation: false,
		videoFit: false,
	},
});
```

Here, you can find all the options:

| Name        | Props  | Description                                          |
| ----------- | ------ | ---------------------------------------------------- |
| `id`        | string | Container id                                         |
| `videoURL`  | string | Video URL                                            |
| `posterURL` | string | Cover URL                                            |
| `headers`   | object | Http request headers                                 |
| `controls`  | object | Controls object. Includes specific controls' elments |
| `hide`      | bool   | Hide control bar                                     |
| `small`     | bool   | Small control bar                                    |
| `rotation`  | bool   | Show rotation button.                                |
| `videoFit`  | bool   | Show video fit (cover/contain) button.               |

#### Events and errors handling

You can access player events like a jQuery "on" / "off" method. Replace "eventname" with one of the following names. Props means the elements passed through callback.

```js
player.on("eventname", (evt, ...props) => {
	/*...do something*/
});
```

Here, you can find all the events:

| Name        | Props          | Description                                                   |
| ----------- | -------------- | ------------------------------------------------------------- |
| `init`      | null           | The player is initialized and the video is ready              |
| `ready`     | null           | Video is ready                                                |
| `play`      | null           | Video is playing                                              |
| `pause`     | null           | Video is in pause                                             |
| `ended`     | null           | Video is ended                                                |
| `buffering` | null           | Video is buffering                                            |
| `error`     | int: errorCode | There was an error. The events pass an error code. See below. |

### Contributors

-   Thanks to [video.js team](https://github.com/videojs/video.js) for base library
