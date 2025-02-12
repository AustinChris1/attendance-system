import * as esbuild from "esbuild"
import { writeFile, mkdir, rm } from "fs/promises";
import { existsSync } from "fs";

const buildConfig = {
    version: 3,
    routes: [
        {
            src: "/.*",
            dest: "/",
        },
    ],
};

const functionConfig = {
    runtime: "nodejs20.x",
    handler: "index.mjs",
};

const buildDir = "./.vercel/output";
const functionDirectory = `${buildDir}/functions/index.func`;


if (existsSync(buildDir)) {
    await rm(buildDir, { recursive: true });
}

await mkdir(functionDirectory, { recursive: true });

await writeFile(
    `${functionDirectory}/.vc-config.json`,
    JSON.stringify(functionConfig),
);

await writeFile(`${buildDir}/config.json`, JSON.stringify(buildConfig));

await esbuild.build({
    bundle: true,
    format: "esm",
    // outdir: functionDirectory,
    platform: "node",
    loader: {
        ".node": "file",
        ".html": "text",
    },
    external: ["mock-aws-s3", "aws-sdk", "nock"],
    entryPoints: ["./scripts/run.ts"],
    outfile: `${functionDirectory}/index.mjs`,
}).then(res => console.log(res))