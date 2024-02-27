import { readFileSync, writeFileSync } from "node:fs";
import { EOL } from "node:os";
import { determinePolicies, isUpAble } from "./determine-policies.js";
import { updateManifest } from "./update-manifest.js";
const INDENT = 2;
function getMaxAttributeLength(pOutdatedList, pAttribute) {
  const lExtraPad = 2;
  return (
    pOutdatedList
      .map((pOutdatedEntry) => pOutdatedEntry[pAttribute]?.length ?? 0)
      .reduce((pMax, pCurrent) => (pCurrent > pMax ? pCurrent : pMax), 0) +
    lExtraPad
  );
}
function constructSuccessMessage(pOutdatedList) {
  let lReturnValue = "";
  const lMaxPackageLength = getMaxAttributeLength(pOutdatedList, "package");
  const lMaxCurrentLength = getMaxAttributeLength(pOutdatedList, "current");
  const lMaxTargetLength = getMaxAttributeLength(pOutdatedList, "target");
  const lMaxTypeLength = getMaxAttributeLength(pOutdatedList, "type");
  const lUpdated = pOutdatedList.filter(isUpAble);
  if (lUpdated.length > 0) {
    lReturnValue += `Up'em just updated these outdated dependencies in package.json:${EOL}${EOL}${lUpdated
      .map(
        (pOutdatedEntry) =>
          `${pOutdatedEntry.package.padEnd(lMaxPackageLength)}${pOutdatedEntry.current.padEnd(lMaxCurrentLength)} -> ${pOutdatedEntry.target.padEnd(lMaxTargetLength)}${pOutdatedEntry.type?.padEnd(lMaxTypeLength) ?? ""} (policy: ${pOutdatedEntry.policy})`,
      )
      .join(EOL)}${EOL}${EOL}`;
  }
  const lNotUpdated = pOutdatedList.filter(
    (pOutdatedEntry) => !isUpAble(pOutdatedEntry),
  );
  if (lNotUpdated.length > 0) {
    lReturnValue += `Up'em found these packages were outdated, but did not update them because of policies:${EOL}${EOL}${lNotUpdated
      .map(
        (pOutdatedEntry) =>
          `${pOutdatedEntry.package.padEnd(lMaxPackageLength)}${pOutdatedEntry.current.padEnd(lMaxTargetLength)}${pOutdatedEntry.type?.padEnd(lMaxTypeLength) ?? ""} (policy: ${pOutdatedEntry.policy})`,
      )
      .join(EOL)}${EOL}${EOL}`;
  }
  return lReturnValue;
}
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
      message: constructSuccessMessage(lOutdatedList),
    };
  }
  return {
    OK: true,
    outdatedList: lOutdatedList,
  };
}
export default function upem(
  pPackageInputFileName,
  pOutdatedJSON,
  pPackageOutputFileName = pPackageInputFileName,
  pOptions = {},
) {
  try {
    const lPackageFile = readFileSync(pPackageInputFileName, {
      encoding: "utf8",
    });
    const lPackageObject = JSON.parse(lPackageFile);
    const lOutdatedResult = determineOutdated(pOutdatedJSON, lPackageObject);
    if (!lOutdatedResult.outdatedList) {
      return lOutdatedResult;
    }
    try {
      if (!pOptions.dryRun) {
        writeFileSync(
          pPackageOutputFileName,
          JSON.stringify(
            updateManifest(
              lPackageObject,
              lOutdatedResult.outdatedList.filter(isUpAble),
              pOptions,
            ),
            null,
            INDENT,
          ),
        );
      }
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
