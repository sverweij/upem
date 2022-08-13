/**
 *
 * @param {import("../types/upem.js").IUpemOutdated} pOutdatedEntry
 * @param {import("../types/upem.js").PolicyType} pPolicy
 * @returns {string}
 */
function determineTargetVersion(pOutdatedEntry, pPolicy) {
  return pOutdatedEntry[pPolicy] || pOutdatedEntry.current;
}

/**
 *
 * @param {{[package:string]:{[name:string]: string}}} pObject
 * @returns {{package: string, [name:string]:string}[]}
 */
function objectToArray(pObject) {
  return Object.keys(pObject).map((pKey) => ({
    package: pKey,
    ...pObject[pKey],
  }));
}

/**
 *
 * @param {import("../types/upem.js").IUpemPolicy[]} pPolicies
 * @param {import("../types/upem.js").IUpemOptions} pOptions
 * @returns {(Partial<import("../types/upem.js").IUpemOutdated) => import("../types/upem.js").IUpemOutdated}
 */
function tagOutdatedEntry(pPolicies) {
  return (pOutdatedEntry) => {
    /** @type import("../types/upem.js").IUpemPolicy */
    const lPolicy =
      pPolicies.find((pPolicy) => pPolicy.package === pOutdatedEntry.package)
        ?.policy ?? "latest";

    return {
      ...pOutdatedEntry,
      policy: lPolicy,
      target: determineTargetVersion(pOutdatedEntry, lPolicy),
    };
  };
}

/**
 *
 * @param {import("../types/upem.js").IUpemOutdated} pOutdated
 */
export function isUpAble(pOutdated) {
  return pOutdated.current !== pOutdated.target;
}

/**
 *
 * @param {import("../types/upem.js").INpmOutdated} pOutdatedPackages
 * @param {import("../types/upem.js").IUpemPolicy[]} pPolicies
 * @returns {import("../types/upem.js").IUpemOutdated[]}
 */
export function determinePolicies(pOutdatedPackages, pPolicies) {
  return objectToArray(pOutdatedPackages).map(tagOutdatedEntry(pPolicies));
}
