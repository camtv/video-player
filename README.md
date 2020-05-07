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
	bookmarks: false,
	overlays: false,
	headers: {
		Authorization: "Bearer xxxxx",
	},
	floatingControls: {
		playToggle: true,
		audioToggle: {
			restart: false,
			html: "",
		},
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

#### Main video parameters

The first parameters defines all base options about video, such as autoplay or preload.
You can find all possible values in the table below:

| Name               | Props       | Default | Description                                                                                |
| ------------------ | ----------- | ------- | ------------------------------------------------------------------------------------------ |
| `id`               | string      | none    | Container id                                                                               |
| `videoURL`         | string      | none    | Video URL                                                                                  |
| `posterURL`        | string      | none    | Cover URL                                                                                  |
| `autoplay`         | bool/string | false   | true, false, "muted"                                                                       |
| `muted`            | bool        | false   | true, false                                                                                |
| `preload`          | string      | auto    | "auto", "metadata", "none"                                                                 |
| `small`            | bool        | false   | Small controls                                                                             |
| `bookmarks`        | bool        | false   | Stores and shows bookmarks dialog which allow the resume of video                          |
| `overlays`         | bool/array  | false   | Overlays object. Includes specific controls' elements. To disable controlBar use false     |
| `headers`          | object      | null    | Http request headers                                                                       |
| `floatingControls` | bool/object | object  | Floating controls object. Includes specific controls that are not inside the controls' bar |
| `controls`         | bool/object | object  | Controls object. Includes specific controls' elements. To disable controlBar use false     |

#### Floating controls

This options refers to all controls that are not inside the controls' bar, such as big play button or volume toggle button.
Setting floatingControls to false will disable all floating buttons.

To enable fine tuning, you have to set an object. Here, you can find all the options:

| Name          | Props       | Description                                                                                                                     |
| ------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `playToggle`  | bool        | Show play/pause big center button.                                                                                              |
| `audioToggle` | bool/object | Show and configure mute/unmute top right button. Object includes restart (restarts video if unmuted), html (inner html content) |

#### Controls' bar

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

#### Overlay elements

This options enables some overlay elements during playing, pause, timeupdate or any other event.
This options inherits from [videojs-overlay library](https://github.com/brightcove/videojs-overlay) and you could have a looke at that options.
This is basically an array of objects. You can set content (inner html), start/end time in seconds or event, div's classes and optionally alignment

```js
overlays: [
	{
		content: "<span>The video is playing</span>",
		start: "play",
		end: "pause",
		class: "my-css-class overlayA",
		align: "bottom-right",
	},
	{
		content: "<span>The video is paused</span>",
		start: "pause",
		end: "play",
		class: "my-css-class overlayE",
		align: "top",
	},
	{
		content: "<span>The video is ended</span>",
		start: "ended",
		end: "play",
		class: "my-css-class overlayD",
		align: "bottom-right",
	},
	{
		content: "<span>The video is 0-40</span>",
		start: 0,
		end: 40,
		class: "my-css-class overlayB",
		align: "top-left",
	},
	{
		content: "<span>The video is 15-30</span>",
		start: 15,
		end: 30,
		class: "my-css-class overlayC",
		align: "bottom-left",
	},
];
```

Here, you can find all the options:

| Name      | Props      | Default  | Description                        |
| --------- | ---------- | -------- | ---------------------------------- |
| `content` | string     | null     | Html string content                |
| `start`   | int/string | null     | Seconds or events to show overlay. |
| `end`     | int/string | null     | Seconds or events to hide overlay. |
| `class`   | string     | null     | Overlay div's class to merge       |
| `align`   | string     | top-left | Alignment of the balloon.          |

If you want to simply show a full-player overlay, seta custom css class and overlay css properties.

### Methods

This is a list of all public methods for player instance.

| Method                  | Description                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| `destroy()`             | Removes player events and instance                                                         |
| `addEvents()`           | Add player events. This is done automatically on player init constructor                   |
| `removeEvents()`        | Removes player events                                                                      |
| `playVideo(seconds)`    | Start playing video. If seconds is passed it start from the given seconds amount           |
| `pauseVideo()`          | Pauses video                                                                               |
| `setMute(toMute)`       | Set mute                                                                                   |
| `getStateVideo()`       | Retrurns the state of video in string format: not_ready, buffering, playing, paused, ended |
| `getBufferPercent()`    | Returns the buffering amount in percent                                                    |
| `getVideoDuration()`    | Returns video total duration if available, zero otherwise                                  |
| `getVideoCurrentTime()` | Returns the number of seconds that have been played.                                       |
| `getFullscreen()`       | Returns if player is in fullscreen                                                         |
| `setFullscreen(val)`    | Enables or disables fullscreen mode                                                        |
| `isInViewport()`        | Returns if player is visible in viewport                                                   |

### Events and errors handling

You can access player events like a jQuery "on" / "off" method. Replace "eventname" with one of the following names. Props means the elements passed through callback.

```js
player.on("eventname", (evt, ...props) => {
	/*...do something*/
});
```

Here, you can find all the events:

| Name        | Props          | Description                                                                                       |
| ----------- | -------------- | ------------------------------------------------------------------------------------------------- |
| `init`      | null           | The player is initialized and the video is ready                                                  |
| `ready`     | null           | Video is ready                                                                                    |
| `play`      | null           | Video is playing                                                                                  |
| `pause`     | null           | Video is in pause                                                                                 |
| `ended`     | null           | Video is ended                                                                                    |
| `buffering` | null           | Video is buffering                                                                                |
| `tracking`  | object         | Tracking played chunks and effectively amount of time. Returns an object like { seconds, chunks } |
| `error`     | int: errorCode | There was an error. The events pass an error code. See below.                                     |

### Contributors

-   Thanks to [video.js](https://github.com/videojs/video.js) for base library
-   Thanks to [videojs-http-source-selector](https://github.com/jfujita/videojs-http-source-selector) for videojs http source selector component
-   Thanks to [videojs-seek-buttons](https://github.com/mister-ben/videojs-seek-buttons) for videojs seek buttons
-   Thanks to [videojs-overlay](https://github.com/brightcove/videojs-overlay) for videojs overlay library
