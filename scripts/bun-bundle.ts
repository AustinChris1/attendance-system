import { $ } from "bun";

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

const packageJson = {
	type: "module",
	dependencies: {
		"@tensorflow/tfjs-node": "^4.22.0",
	},
};

const buildDir = "./.vercel/output";
const functionDirectory = `${buildDir}/functions/index.func`;

await Bun.build({
	entrypoints: ["./scripts/run.ts"],
	outdir: "./build",
	target: "node",
	external: ["@tensorflow/tfjs-node"],
}).then(console.log);

await $`rm -rf ${buildDir}`;

await Bun.write(`${buildDir}/config.json`, JSON.stringify(buildConfig));

await $`mkdir -p ${functionDirectory}`;

await Bun.write(
	`${functionDirectory}/.vc-config.json`,
	JSON.stringify(functionConfig),
);

await $`
cp ./build/* ${functionDirectory}
mv ${functionDirectory}/{run.js,index.mjs}
`;

await Bun.write(
	`${functionDirectory}/package.json`,
	JSON.stringify(packageJson),
);

await $`
cd ${functionDirectory}
pwd
pnpm install
`;
