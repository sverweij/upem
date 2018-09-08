const _get = require('lodash.get')

function updateDeps (pDependencyObject, pOutdatedObject, pDoNotUpArray) {
  return Object.assign(
    {},
    pDependencyObject,
    Object.keys(pDependencyObject)
      .filter(pDep => Object.keys(pOutdatedObject).filter(pKey => !pDoNotUpArray.includes(pKey)).some(pPkg => pPkg === pDep))
      .reduce(
        (pAll, pThis) => {
          pAll[pThis] = pOutdatedObject[pThis].latest
          return pAll
        },
        {}
      )
  )
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
function updateAllDeps (pPackageObject, pOutdatedObject = {}) {
  const lDoNotUpArray = _get(pPackageObject, 'upem.donotup') || []

  return Object.assign(
    {},
    pPackageObject,
    Object.keys(pPackageObject)
      .filter(pPkgKey => pPkgKey.includes('ependencies'))
      .reduce(
        (pAll, pDepKey) => {
          pAll[pDepKey] = updateDeps(pPackageObject[pDepKey], pOutdatedObject, lDoNotUpArray)
          return pAll
        },
        {}
      )
  )
}
module.exports = {
  updateDeps,
  updateAllDeps
}
