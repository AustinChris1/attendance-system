import { logger } from "hono/logger";
import { Hono } from "hono";
import { router as imageProcessingRouter } from "./modules/image-processing";

export const app = new Hono().use(logger()).get("/", c => c.json({ msg: "Hello" })).route("/", imageProcessingRouter);