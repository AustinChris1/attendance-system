import { describe, it } from "node:test";
import { readFile } from "node:fs/promises";
import assert from "node:assert";

describe("Integration tests", () => {
	it("should identify Austin", async () => {
		const austinImage = await readFile("./tests/assets/austin.jpeg");
		const formData = new FormData();
		formData.append("image", new Blob([austinImage], { type: "image/jpeg" }));
		const res = await fetch("http://127.0.0.1:3000/stream", {
			method: "POST",
			body: formData,
		});
		assert(res.status === 200, "Failed to recognize");
	});
	it("should identify kingsley", async () => {
		const kingsleyImage = await readFile("./tests/assets/kingsley.jpg");
		const formData = new FormData();
		formData.append("image", new Blob([kingsleyImage], { type: "image/jpeg" }));
		const res = await fetch("http://127.0.0.1:3000/stream", {
			method: "POST",
			body: formData,
		});
		assert(res.status === 200, "Failed to recognize");
	});
	it("should identify frank", async () => {
		const frankImage = await readFile("./tests/assets/frank.jpg");
		const formData = new FormData();
		formData.append("image", new Blob([frankImage], { type: "image/jpeg" }));
		const res = await fetch("http://127.0.0.1:3000/stream", {
			method: "POST",
			body: formData,
		});
		assert(res.status === 200, "Failed to recognize");
	});
});
