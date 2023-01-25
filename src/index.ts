import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";

const app = new Hono();

app.use("/", cors());

app.all("/", async (c) => {
	const { id } = c.req.query();

	if (!id) {
		return c.redirect("https://andrewjazbec.com"); // TODO: update to demo site
	}

	const videoID = z.string().parse(id);
	const youtubeVideoURL = `https://www.youtube.com/watch?v=${videoID}`;

	const response = await fetch(youtubeVideoURL);
	const html = await response.text();

	// find video data object:  ytInitialPlayerResponse = {...};
	const regex = html.match(`var ytInitialPlayerResponse = (.*);<\/script>`);
	if (!regex) throw new Error("Unable to find video data");

	const json = JSON.parse(regex[1]);

	return c.json(json);
});

app.onError((err, c) => {
	console.error(`${err}`);
	return c.text(err.toString(), 500);
});

export default app;
