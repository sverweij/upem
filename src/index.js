import fs from "fs";
import core from "./core.js";

const INDENT = 2;

function determineOutdated(pOutdatedObject, pPackageObject) {
  pOutdatedObject =
    pOutdatedObject.length <= 0 ? {} : JSON.parse(pOutdatedObject);
  const lOutdatedObject = core.filterOutdatedPackages(
    pOutdatedObject,
    pPackageObject
  );

  if (Object.keys(pOutdatedObject).length <= 0) {
    return {
      OK: true,
      message: "  Up'em says: Everything seems to be up to date already.\n\n",
    };
  }

  if (Object.keys(lOutdatedObject).length <= 0) {
    return {
      OK: true,
      message:
        "  Up'em says: Everything not in 'upem.donotup' seems to be up to date already.\n\n",
    };
  }

  return {
    OK: true,
    outdatedObject: lOutdatedObject,
  };
}

export default function upem(
  pPackageInputFileName,
  pOutdatedObject,
  pPackageOutputFileName = pPackageInputFileName,
  pOptions
) {
  try {
    const lPackageFile = fs.readFileSync(pPackageInputFileName);
    const lPackageObject = JSON.parse(lPackageFile);

    const lOutdatedResult = determineOutdated(pOutdatedObject, lPackageObject);

    if (!lOutdatedResult.outdatedObject) {
      return lOutdatedResult;
    }

    try {
      fs.writeFileSync(
        pPackageOutputFileName,
        JSON.stringify(
          core.updateAllDeps(
            lPackageObject,
            lOutdatedResult.outdatedObject,
            pOptions
          ),
          // eslint-disable-next-line unicorn/no-null
          null,
          INDENT
        )
      );
      return {
        OK: true,
        message: `  Up'em just updated all outdated dependencies in package.json to latest:\n\n    ${Object.keys(
          lOutdatedResult.outdatedObject
        ).join(", ")}\n\n`,
      };
    } catch (pError) {
      return {
        OK: false,
        message: `  Up'em encountered a hitch when updating package.json:\n${pError}\n\n`,
      };
    }
  } catch (pError) {
    return {
      OK: false,
      message: `  Up'em encountered a hitch:\n${pError}\n\n`,
    };
  }
}
