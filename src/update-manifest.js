/**
 *
 * @param {import("../types/upem.js").DependenciesTypeType[]} pSkipDependencyTypes
 * @returns {(string) => boolean}
 */
function getUpAbleDependencyKeys(pSkipDependencyTypes) {
  return (pManifestKey) =>
    pManifestKey.includes("ependencies") &&
    !pSkipDependencyTypes.includes(pManifestKey);
}

/**
 *
 * @param {string} pVersionRangeString
 * @returns {string}
 */
function getRangePrefix(pVersionRangeString) {
  return (
    // eslint-disable-next-line security/detect-unsafe-regex
    pVersionRangeString.match(/^(?<prefix>[^0-9]{0,2}).+/)?.groups?.prefix ?? ""
  );
}

/**
 *
 * @param {string} pVersionRangeString
 * @param {import("../types/upem.js").IUpemOptions} pOptions
 * @returns {string}
 */
export function determineSavePrefix(pVersionRangeString, pOptions) {
  const lIndividualRangePrefix = getRangePrefix(pVersionRangeString);

  if (pOptions?.saveExact && lIndividualRangePrefix) {
    return lIndividualRangePrefix;
  }

  return pOptions?.saveExact ? "" : pOptions?.savePrefix ?? "^";
}

/**
 *
 * @param {{[packageName: string]: string}} pDependencyObject
 * @param {import("../types/upem.js").IUpemOutdated[]} pOutdatedList
 * @param {import("../types/upem.js").IUpemOptions} pOptions
 * @returns {{[packageName: string]: string}}
 */
export function updateDependencyKey(
  pDependencyObject,
  pOutdatedList,
  pOptions = {}
) {
  return {
    ...pDependencyObject,
    ...Object.keys(pDependencyObject)
      .filter((pDependency) =>
        pOutdatedList.some(
          (pOutdatedEntry) => pOutdatedEntry.package === pDependency
        )
      )
      .reduce((pAll, pPackageName) => {
        pAll[pPackageName] = `${determineSavePrefix(
          pDependencyObject[pPackageName],
          pOptions
        )}${
          pOutdatedList.find(
            (pOutdatedEntry) => pOutdatedEntry.package === pPackageName
          ).target
        }`;
        return pAll;
      }, {}),
  };
}

/**
 *
 * @param {import("../types/upem.js").IManifest} pManifestObject
 * @param {import("../types/upem.js").IUpemOutdated} pOutdatedPackages
 * @param {import("../types/upem.js").IUpemOptions} pOptions
 * @returns {import("../types/upem.js").IManifest}
 */
export function updateManifest(pManifestObject, pOutdatedPackages, pOptions) {
  return {
    ...pManifestObject,
    ...Object.keys(pManifestObject)
      .filter(getUpAbleDependencyKeys(pOptions?.skipDependencyTypes ?? []))
      .reduce((pAll, pDependencyKey) => {
        pAll[pDependencyKey] = updateDependencyKey(
          pManifestObject[pDependencyKey],
          pOutdatedPackages,
          pOptions
        );
        return pAll;
      }, {}),
  };
}
