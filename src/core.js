import { determineSavePrefix, getPolicyOverrides } from "./core-helpers.js";

function getUpdatePolicy(pDependency, pWantedArray) {
  return pWantedArray.includes(pDependency) ? "wanted" : "latest";
}

function updateDeps(
  pDependencyObject,
  pOutdatedPackagesObject,
  pOptions = {},
  pWantedArray = []
) {
  return {
    ...pDependencyObject,
    ...Object.keys(pDependencyObject)
      .filter((pDep) => Object.keys(pOutdatedPackagesObject).includes(pDep))
      .reduce((pAll, pThis) => {
        pAll[pThis] = `${determineSavePrefix(
          pDependencyObject[pThis],
          pOptions
        )}${
          pOutdatedPackagesObject[pThis][getUpdatePolicy(pThis, pWantedArray)]
        }`;
        return pAll;
      }, {}),
  };
}

function filterOutdatedPackages(pOutdatedObject, pPackageObject) {
  const lReturnValue = { ...pOutdatedObject };

  Object.keys(lReturnValue)
    .filter((pKey) => getPolicyOverrides(pPackageObject, "pin").includes(pKey))
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
  const lWantedArray = getPolicyOverrides(pPackageObject, "wanted");
  return {
    ...pPackageObject,
    ...Object.keys(pPackageObject)
      .filter(
        (pPackageKey) =>
          pPackageKey.includes("ependencies") &&
          !(pOptions?.skipDependencyTypes ?? []).includes(pPackageKey)
      )
      .reduce((pAll, pDepKey) => {
        pAll[pDepKey] = updateDeps(
          pPackageObject[pDepKey],
          pOutdatedPackages,
          pOptions,
          lWantedArray
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
