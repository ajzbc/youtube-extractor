async function handleRequest(request) {
	var videoID = new URL(request.url).searchParams.get('id');
	if (!videoID) {
		return new Response('Video id required', { status: 400 });
	}

	//construct youtube url to fetch
	var url = `https://www.youtube.com/watch?v=${videoID}`;

	var response = await fetch(url);
	var text = await response.text();

	//determine if the video is valid
	var isValid = text.split('ytplayer.config = ')[1];
	if (!isValid) {
		return new Response('Invalid video id', { status: 400 });
	}

	//TODO - better check if valid video id

	//strip down to just json
	var fullJSON = isValid.split(';ytplayer.load')[0];
	var obj = JSON.parse(fullJSON);

	var videoInfo = obj['args']['player_response'];
	var clean = videoInfo.replace('\u0026', '&');
	var data = JSON.parse(clean);

	console.log(data);

	// Returns all video info
	// const init = { headers: { 'content-type': 'application/json' } };
	// return new Response(JSON.stringify(data), init);

	//sort by highest resolution
	var formats = data.streamingData.formats.sort((a, b) => (a.width > b.width ? -1 : 1));

	//TODO - decode video url from cipher

	if (formats[0].url) {
		//build response
		var response = {
			title: data.videoDetails.title,
			video: formats[0],
			thumbnail: data.videoDetails.thumbnail.thumbnails[0]
		};
		const init = { headers: { 'content-type': 'application/json' } };
		return new Response(JSON.stringify(response), init);
	} else {
		return new Response('Unable to determine URL', { status: 500 });
	}
}

addEventListener('fetch', (event) => {
	return event.respondWith(handleRequest(event.request));
});
