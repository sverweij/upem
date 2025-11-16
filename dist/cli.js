#!/usr/bin/env node
import { join } from "node:path";
import Config from "@npmcli/config";
import things from "@npmcli/config/lib/definitions/index.js";
import upem from "./main.js";
const { definitions, flatten, shorthands } = things;
const MANIFEST = join(process.cwd(), "package.json");
let gBuffer = "";
function bufferChunk(pChunk) {
	gBuffer += pChunk;
}
function emitGeneralError(pError) {
	process.stderr.write(
		`  Up'em encountered a hitch while reading outdated information:\n${pError}\n\n`,
	);
	process.exitCode = 1;
}
async function loadNpmConfig() {
	let lUpemOptions = null;
	try {
		const config = new Config({
			npmPath: process.cwd(),
			definitions,
			flatten,
			shorthands,
			argv: process.argv,
		});
		await config.load();
		lUpemOptions = {
			saveExact: config.get("save-exact") || false,
			savePrefix: config.get("save-prefix") || "^",
			skipDependencyTypes: ["peerDependencies"],
		};
	} catch (_pError) {
		lUpemOptions = {
			saveExact: false,
			savePrefix: "^",
			skipDependencyTypes: ["peerDependencies"],
		};
	}
	return lUpemOptions;
}
function executeUpdate(pArguments, pUpemOptions) {
	return () => {
		if (!pUpemOptions) {
			process.stderr.write("Error: npm config not loaded\n");
			process.exitCode = 1;
			return;
		}
		const lUpemOptions = {
			...pUpemOptions,
			dryRun: pArguments[pArguments.length - 1] === "--dry-run",
		};
		const lResult = upem(MANIFEST, gBuffer, MANIFEST, lUpemOptions);
		if (lResult.OK) {
			process.stdout.write(lResult.message);
		} else {
			process.stderr.write(lResult.message);
			process.exitCode = 1;
		}
	};
}
try {
	const gUpemOptions = await loadNpmConfig();
	process.stdin
		.on("data", bufferChunk)
		.on("end", executeUpdate(process.argv, gUpemOptions))
		.on("error", emitGeneralError);
} catch (pError) {
	emitGeneralError(pError);
}
