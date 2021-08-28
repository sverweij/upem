import get from "lodash.get";

function getRangePrefix(pVersionRangeString) {
  return (
    // eslint-disable-next-line security/detect-unsafe-regex
    pVersionRangeString.match(/^(?<prefix>[^0-9]{0,2}).+/).groups.prefix || ""
  );
}

function determineSavePrefix(pVersionRangeString, pOptions) {
  const lIndividualRangePrefix = getRangePrefix(pVersionRangeString);

  if (pOptions.saveExact && lIndividualRangePrefix) {
    return lIndividualRangePrefix;
  }

  return pOptions.saveExact ? "" : pOptions.savePrefix || "^";
}

function updateDeps(pDependencyObject, pOutdatedPackagesObject, pOptions = {}) {
  return {
    ...pDependencyObject,
    ...Object.keys(pDependencyObject)
      .filter((pDep) => Object.keys(pOutdatedPackagesObject).includes(pDep))
      .reduce((pAll, pThis) => {
        pAll[pThis] = `${determineSavePrefix(
          pDependencyObject[pThis],
          pOptions
        )}${pOutdatedPackagesObject[pThis].latest}`;
        return pAll;
      }, {}),
  };
}

function getPinnedArray(pPackageObject) {
  return get(pPackageObject, "upem.policies", [])
    .filter((pPolicy) => pPolicy.policy === "pin")
    .map((pPolicy) => get(pPolicy, "package"));
}

function filterOutdatedPackages(pOutdatedObject, pPackageObject) {
  const lReturnValue = { ...pOutdatedObject };

  Object.keys(lReturnValue)
    .filter((pKey) => getPinnedArray(pPackageObject).includes(pKey))
    .forEach((pKey) => Reflect.deleteProperty(lReturnValue, pKey));
  return lReturnValue;
}

/**
 * Updates all dependencies in the passed package.json that match a key in the
 * passed outdated object to the _latest_ in that object, ignoring the
 * packages mentioned in the upem.donotup key.
 *
 * @param {any} pPackageObject - the contents of a package.json in object format
 * @param {any} pOutdatedObject - the output of npm outdated --json, in object format
 * @param {any} pOptions -
 *       saveExact  - how updated packages get prefixed if true:'', if false or left out
 *                    (the default): savePrefix
 *       savePrefix - how updated packages get prefixed; either '~', '^' or '' (the default)
 *
 * @return {any} - the transformed pPackageObject
 */

function updateAllDeps(pPackageObject, pOutdatedPackages = {}, pOptions = {}) {
  return {
    ...pPackageObject,
    ...Object.keys(pPackageObject)
      .filter(
        (pPackageKey) =>
          pPackageKey.includes("ependencies") &&
          !get(pOptions, "skipDependencyTypes", []).includes(pPackageKey)
      )
      .reduce((pAll, pDepKey) => {
        pAll[pDepKey] = updateDeps(
          pPackageObject[pDepKey],
          pOutdatedPackages,
          pOptions
        );
        return pAll;
      }, {}),
  };
}

export default {
  filterOutdatedPackages,
  updateDeps,
  updateAllDeps,
};
