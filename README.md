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
	console.log("initialized!");
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
		console.log("initialized!");
	});
</script>
```

### Configuration

The player can be configured with an object, as you can see below

```js
var player = RenderVideoCamTV({
	id: "",
	videoURL: "",
	posterURL: "",
	autoplay: false,
	muted: false,
	preload: "auto",
	small: false,
	headers: {
		Authorization: "Bearer xxxxx",
	},
	controls: {
		playToggle: true,
		seekButtons: {
			forward: 30,
			back: 30,
		},
		volumePanel: {
			inline: false,
			vertical: false,
		},
		currentTimeDisplay: true,
		timeDivider: true,
		durationDisplay: true,
		rotation: false,
		videoFit: true,
		sourceMenu: true,
		fullscreenToggle: true,
		pictureInPictureToggle: false,
	},
});
```

##### Main video parameters

The first parameters defines all base options about video, such as autoplay or preload.
You can find all possible values in the table below:

| Name        | Props       | Default | Description                                                                           |
| ----------- | ----------- | ------- | ------------------------------------------------------------------------------------- |
| `id`        | string      | none    | Container id                                                                          |
| `videoURL`  | string      | none    | Video URL                                                                             |
| `posterURL` | string      | none    | Cover URL                                                                             |
| `autoplay`  | bool/string | false   | true, false, "muted"                                                                  |
| `muted`     | bool        | false   | true, false                                                                           |
| `preload`   | string      | auto    | "auto", "metadata", "none"                                                            |
| `small`     | bool        | false   | Small controls                                                                        |
| `headers`   | object      | null    | Http request headers                                                                  |
| `controls`  | bool/object | object  | Controls object. Includes specific controls' elments. To disable controlBar use false |

##### Controls' bar

The controls bar can be completely disabled or fine tuned through an object.
To disable controls' bar you have to set controls: false. This will display only play and mute overlay buttons on the video, but disables entirely the control bar.

To enable fine tuning for bar, you have to set an object in order to express wich component you want to show or hide.
Here, you can find all the options:

| Name                     | Props       | Description                                                                      |
| ------------------------ | ----------- | -------------------------------------------------------------------------------- |
| `playToggle`             | bool        | Show play/puase button.                                                          |
| `seekButtons`            | bool/object | Show and configure seek buttons. Object includes forward: seconds, back: seconds |
| `volumePanel`            | bool/object | Show and configure volume panel.                                                 |
| `currentTimeDisplay`     | bool        | Show played time indicator                                                       |
| `timeDivider`            | bool        | Show / time divider.                                                             |
| `durationDisplay`        | bool        | Show video duration.                                                             |
| `rotation`               | bool        | Show rotation button.                                                            |
| `videoFit`               | bool        | Show video fit (cover/contain) button.                                           |
| `sourceMenu`             | bool        | Show video quality source selector if available by video stream (hls only).      |
| `fullscreenToggle`       | bool        | Show fullscreen button.                                                          |
| `pictureInPictureToggle` | bool        | Show picture-in-picure mode button.                                              |

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
