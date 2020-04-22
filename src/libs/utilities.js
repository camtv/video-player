import videojs from "video.js";

export function setRequestHeaders(headers) {
	if (!headers || Object.keys(headers).length == 0)
		return;

	videojs.Hls.xhr.beforeRequest = (opt) => {
		if (!opt.headers)
			return;

		opt.headers = {
			...opt.headers,
			...headers
		}
	}
}

export function makeXHRequest(url) {
	return new Promise((resolve, reject) => {
		var http = new XMLHttpRequest();

		http.open('HEAD', url);
		http.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
		http.setRequestHeader('cache-control', 'max-age=0');
		http.setRequestHeader('pragma', 'no-cache');

		http.onreadystatechange = () => {
			if (http.readyState == http.DONE || http.readyState == http.HEADERS_RECEIVED) {
				if (http.status >= 200 && http.status < 300)
					return resolve();
				reject(http.status);
			}
		}

		http.send();
	});
}