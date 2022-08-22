#!/usr/bin/env node
import { join } from "node:path";
import libNpmConfig from "libnpmconfig";
import upem from "./main.js";

const MANIFEST = join(process.cwd(), "package.json");
/** @type {import("../types/upem.js").IUpemOptions} */
const UPEM_OPTIONS = {
  saveExact: libNpmConfig.read().get("save-exact") || false,
  savePrefix: libNpmConfig.read().get("save-prefix") || "^",
  skipDependencyTypes: ["peerDependencies"],
};
let gBuffer = "";

function bufferChunk(pChunk) {
  gBuffer += pChunk;
}

function emitGeneralError(pError) {
  process.stderr.write(
    `  Up'em encountered a hitch while reading outdated information:\n${pError}\n\n`
  );
  process.exitCode = 1;
}

/**
 *
 * @param {string[]} pArguments
 */
function executeUpdate(pArguments) {
  let lUpemOptions = {
    ...UPEM_OPTIONS,
    dryRun: pArguments[pArguments.length - 1] === "--dry-run",
  };
  return () => {
    const lResult = upem(MANIFEST, gBuffer, MANIFEST, lUpemOptions);

    if (lResult.OK) {
      process.stdout.write(lResult.message);
    } else {
      process.stderr.write(lResult.message);
      process.exitCode = 1;
    }
  };
}

process.stdin
  .on("data", bufferChunk)
  .on("end", executeUpdate(process.argv))
  .on("error", emitGeneralError);
