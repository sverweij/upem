#!/usr/bin/env node
// eslint-disable-next-line node/no-missing-import, node/no-unpublished-import
import path from "node:path";
import libNpmConfig from "libnpmconfig";
import getStdin from "get-stdin";
import up from "../src/index.js";

const PACKAGE_FILE_NAME = path.join(process.cwd(), "package.json");

getStdin()
  .then((pOutdatedObject) => {
    const lResult = up(PACKAGE_FILE_NAME, pOutdatedObject, PACKAGE_FILE_NAME, {
      saveExact: libNpmConfig.read().get("save-exact") || false,
      savePrefix: libNpmConfig.read().get("save-prefix") || "^",
      skipDependencyTypes: ["peerDependencies"],
    });

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
