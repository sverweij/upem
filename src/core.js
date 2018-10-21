const _get = require('lodash.get')

function updateDeps (pDependencyObject, pOutdatedPackagesObject) {
  return Object.assign(
    {},
    pDependencyObject,
    Object.keys(pDependencyObject)
      .filter(pDep => Object.keys(pOutdatedPackagesObject).some(pPkg => pPkg === pDep))
      .reduce(
        (pAll, pThis) => {
          pAll[pThis] = pOutdatedPackagesObject[pThis].latest
          return pAll
        },
        {}
      )
  )
}

function filterOutdatedPackages (pOutdatedObject, pPackageObject) {
  const lDoNotUpArray = _get(pPackageObject, 'upem.donotup', [])
  const lRetval = Object.assign({}, pOutdatedObject)

  Object.keys(lRetval)
    .filter(pKey => lDoNotUpArray.includes(pKey))
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
 *
 * @return {any} - the transformed pPackageObject
 */
function updateAllDeps (pPackageObject, pOutdatedPackages = {}) {
  return Object.assign(
    {},
    pPackageObject,
    Object.keys(pPackageObject)
      .filter(pPkgKey => pPkgKey.includes('ependencies'))
      .reduce(
        (pAll, pDepKey) => {
          pAll[pDepKey] = updateDeps(pPackageObject[pDepKey], pOutdatedPackages)
          return pAll
        },
        {}
      )
  )
}
module.exports = {
  filterOutdatedPackages,
  updateDeps,
  updateAllDeps
}
