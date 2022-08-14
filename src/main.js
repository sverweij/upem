import { readFileSync, writeFileSync } from "node:fs";
import { determinePolicies, isUpAble } from "./determine-policies.js";
import { updateManifest } from "./update-manifest.js";

const INDENT = 2;

/**
 *
 * @param {string} pOutdatedObject
 * @param {import("../types/upem.js").IManifest} pPackageObject
 * @returns
 */
function determineOutdated(pOutdatedObject, pPackageObject) {
  const lOutdatedObject =
    pOutdatedObject.length <= 0 ? {} : JSON.parse(pOutdatedObject);
  const lPolicies = pPackageObject?.upem?.policies || [];
  const lOutdatedList = determinePolicies(lOutdatedObject, lPolicies);

  if (lOutdatedList.length <= 0) {
    return {
      OK: true,
      message: "  Up'em says: Everything seems to be up to date already.\n\n",
    };
  }

  if (lOutdatedList.filter(isUpAble).length <= 0) {
    return {
      OK: true,
      message:
        "  Up'em says: Everything not pinned in 'upem.policies' seems to be up to date already.\n\n",
    };
  }

  return {
    OK: true,
    outdatedList: lOutdatedList,
  };
}
/**
 *
 * @param {string} pPackageInputFileName
 * @param {import("../types/upem.js").INpmOutdated} pOutdatedObject
 * @param {string} pPackageOutputFileName
 * @param {import("../types/upem.js").IUpemOptions} pOptions
 * @returns {import("../types/upem.js").IUpemReturn}
 */
export default function upem(
  pPackageInputFileName,
  pOutdatedObject,
  pPackageOutputFileName = pPackageInputFileName,
  pOptions
) {
  try {
    const lPackageFile = readFileSync(pPackageInputFileName);
    const lPackageObject = JSON.parse(lPackageFile);
    const lOutdatedResult = determineOutdated(pOutdatedObject, lPackageObject);

    if (!lOutdatedResult.outdatedList) {
      return lOutdatedResult;
    }

    try {
      writeFileSync(
        pPackageOutputFileName,
        JSON.stringify(
          updateManifest(
            lPackageObject,
            lOutdatedResult.outdatedList.filter(isUpAble),
            pOptions
          ),
          // eslint-disable-next-line unicorn/no-null
          null,
          INDENT
        )
      );
      return {
        OK: true,
        message: `  Up'em just updated all outdated dependencies in package.json to latest:\n\n    ${lOutdatedResult.outdatedList
          .filter(isUpAble)
          .map((pOutdatedEntry) => pOutdatedEntry.package)
          .join(", ")}\n\n`,
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