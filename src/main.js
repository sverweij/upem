import { readFileSync, writeFileSync } from "node:fs";
import { EOL } from "node:os";
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
 * @param {import("../types/upem.js").IUpemOutdated[]} pOutdatedList
 * @param {string} pAttribute
 */
function getMaxAttributeLength(pOutdatedList, pAttribute) {
  const lExtraPad = 2;

  return (
    pOutdatedList
      .map((pOutdatedEntry) => pOutdatedEntry[pAttribute].length)
      .reduce((pMax, pCurrent) => (pCurrent > pMax ? pCurrent : pMax), 0) +
    lExtraPad
  );
}

/**
 *
 * @param {import("../types/upem.js").IUpemOutdated[]} pOutdatedList
 * @returns {string}
 */
function constructSuccessMessage(pOutdatedList) {
  const lMaxPackageLength = getMaxAttributeLength(pOutdatedList, "package");
  const lMaxCurrentLength = getMaxAttributeLength(pOutdatedList, "current");
  const lMaxTargetLength = getMaxAttributeLength(pOutdatedList, "target");

  let lReturnValue = `Up'em just updated these outdated dependencies in package.json:${EOL}${EOL}${pOutdatedList
    .filter(isUpAble)
    .map(
      (pOutdatedEntry) =>
        `${pOutdatedEntry.package.padEnd(
          lMaxPackageLength
        )}${pOutdatedEntry.current.padEnd(
          lMaxCurrentLength
        )} -> ${pOutdatedEntry.target.padEnd(lMaxTargetLength)} (policy: ${
          pOutdatedEntry.policy
        })`
    )
    .join(EOL)}${EOL}${EOL}`;

  const lNotUpdated = pOutdatedList.filter(
    (pOutdatedEntry) => !isUpAble(pOutdatedEntry)
  );

  if (lNotUpdated.length > 0) {
    lReturnValue += `Up'em found these packages were outdated, but did not update them because of policies:${EOL}${EOL}${lNotUpdated
      .map(
        (pOutdatedEntry) =>
          `${pOutdatedEntry.package.padEnd(
            lMaxPackageLength
          )}${pOutdatedEntry.current.padEnd(lMaxTargetLength)} (policy: ${
            pOutdatedEntry.policy
          })`
      )
      .join(EOL)}${EOL}${EOL}`;
  }
  return lReturnValue;
}

/**
 *
 * @param {string} pPackageInputFileName
 * @param {string} pOutdatedJSON
 * @param {string} pPackageOutputFileName
 * @param {import("../types/upem.js").IUpemOptions} pOptions
 * @returns {import("../types/upem.js").IUpemReturn}
 */
export default function upem(
  pPackageInputFileName,
  pOutdatedJSON,
  pPackageOutputFileName = pPackageInputFileName,
  pOptions
) {
  try {
    const lPackageFile = readFileSync(pPackageInputFileName);
    const lPackageObject = JSON.parse(lPackageFile);
    const lOutdatedResult = determineOutdated(pOutdatedJSON, lPackageObject);

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
        message: constructSuccessMessage(lOutdatedResult.outdatedList),
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
