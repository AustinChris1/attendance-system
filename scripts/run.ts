import { serve } from "@hono/node-server";
import { app } from "../src";

const port = 3000;

serve(
	{
		fetch: app.fetch,
		port,
	},
	(info) => {
		console.log(
			`Server running on port ${info.address}:${info.port} and processing stream for face recognition`,
		);
	},
);
