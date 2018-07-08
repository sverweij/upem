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
