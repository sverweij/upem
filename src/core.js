const _get = require('lodash.get')

function updateDeps (pDependencyObject, pOutdatedPackagesObject, pOptions = {}) {
  const lSavePrefix = pOptions.saveExact ? '' : pOptions.savePrefix || '^'

  return {
    ...pDependencyObject,
    ...Object.keys(pDependencyObject)
      .filter(pDep => Object.keys(pOutdatedPackagesObject).some(pPkg => pPkg === pDep))
      .reduce(
        (pAll, pThis) => {
          pAll[pThis] = `${lSavePrefix}${pOutdatedPackagesObject[pThis].latest}`
          return pAll
        },
        {}
      )
  }
}

function getDoNotUpArray (pPackageObject) {
  return _get(pPackageObject, 'upem.donotup', [])
    .map(pPackage => typeof pPackage === 'string' ? pPackage : _get(pPackage, 'package'))
    .filter(pPackage => Boolean(pPackage))
}

function filterOutdatedPackages (pOutdatedObject, pPackageObject) {
  const lRetval = { ...pOutdatedObject }

  Object.keys(lRetval)
    .filter(pKey => getDoNotUpArray(pPackageObject).includes(pKey))
    .forEach(pKey => delete lRetval[pKey])
  return lRetval
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

function updateAllDeps (pPackageObject, pOutdatedPackages = {}, pOptions = {}) {
  return {
    ...pPackageObject,
    ...Object.keys(pPackageObject)
      .filter(pPkgKey => pPkgKey.includes('ependencies'))
      .reduce(
        (pAll, pDepKey) => {
          pAll[pDepKey] = updateDeps(pPackageObject[pDepKey], pOutdatedPackages, pOptions)
          return pAll
        },
        {}
      )
  }
}

module.exports = {
  filterOutdatedPackages,
  updateDeps,
  updateAllDeps
}
