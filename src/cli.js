#!/usr/bin/env node
import path from "node:path";
import libNpmConfig from "libnpmconfig";
import getStdin from "get-stdin";
import upem from "./main.js";

const PACKAGE_FILE_NAME = path.join(process.cwd(), "package.json");
/** @type {import("../types/upem.js").IUpemOptions} */
const UPEM_OPTIONS = {
  saveExact: libNpmConfig.read().get("save-exact") || false,
  savePrefix: libNpmConfig.read().get("save-prefix") || "^",
  skipDependencyTypes: ["peerDependencies"],
};

getStdin()
  .then((pOutdatedObject) => {
    const lResult = upem(
      PACKAGE_FILE_NAME,
      pOutdatedObject,
      PACKAGE_FILE_NAME,
      UPEM_OPTIONS
    );

    if (lResult.OK) {
      process.stdout.write(lResult.message);
    } else {
      process.stderr.write(lResult.message);
    }
  })
  .catch((pError) => {
    process.stderr.write(
      `  Up'em encountered a hitch when reading outdated information:\n${pError}\n\n`
    );
  });
