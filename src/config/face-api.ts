// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
import "@tensorflow/tfjs-node";

import * as faceapi from "@vladmandic/face-api";
import canvas from "canvas";

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
faceapi.env.monkeyPatch({
	Canvas: canvas.Canvas,
	Image: canvas.Image,
	ImageData: canvas.ImageData,
} as any);
