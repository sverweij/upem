#!/usr/bin/env node
/* eslint-disable node/shebang */
import { join } from "node:path";
// @ts-expect-error - no type definition exists for libnpmconfig
import libNpmConfig from "libnpmconfig";
import { IUpemOptions } from "../types/upem";
import upem from "./main.js";

const MANIFEST = join(process.cwd(), "package.json");
const UPEM_OPTIONS: IUpemOptions = {
  saveExact: libNpmConfig.read().get("save-exact") || false,
  savePrefix: libNpmConfig.read().get("save-prefix") || "^",
  skipDependencyTypes: ["peerDependencies"],
};
let gBuffer = "";

function bufferChunk(pChunk: string): void {
  gBuffer += pChunk;
}

function emitGeneralError(pError: Error): void {
  process.stderr.write(
    `  Up'em encountered a hitch while reading outdated information:\n${pError}\n\n`
  );
  process.exitCode = 1;
}

function executeUpdate(pArguments: string[]) {
  const lUpemOptions: IUpemOptions = {
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
