const fs = require('fs')
const up = require('.')

/* eslint complexity:0 */
module.exports = (pPackageInputFileName, pOutdatedObject, pPackageOutputFileName = pPackageInputFileName) => {
  try {
    pOutdatedObject = pOutdatedObject.length <= 0 ? {} : JSON.parse(pOutdatedObject)
    const lPackageFile = fs.readFileSync(pPackageInputFileName)
    let lPackageObject = JSON.parse(lPackageFile)
    const lOutdatedObject = up.filterOutdatedPackages(pOutdatedObject, lPackageObject)

    if (Object.keys(pOutdatedObject).length <= 0) {
      return {
        OK: true,
        message: `  Up'em says: Everything seems to be up to date already.\n\n`
      }
    }

    if (Object.keys(lOutdatedObject).length <= 0) {
      return {
        OK: true,
        message: `  Up'em says: Everything not in 'upem.donotup' seems to be up to date already.\n\n`
      }
    }
    try {
      fs.writeFileSync(pPackageOutputFileName, JSON.stringify(up.updateAllDeps(lPackageObject, lOutdatedObject), null, 2))
      return {
        OK: true,
        message: `  Up'em just updated all dependencies in package.json to latest\n\n`
      }
    } catch (pPackageWriteError) {
      return {
        OK: false,
        message: `  Up'em encountered a hitch when updating package.json:\n${pPackageWriteError}\n\n`
      }
    }
  } catch (pPackageReadError) {
    return {
      OK: false,
      message: `  Up'em encountered a hitch:\n${pPackageReadError}\n\n`
    }
  }
}
