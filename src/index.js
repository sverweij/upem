const fs = require('fs')
const core = require('./core')

function determineOutdated (pOutdatedObject, pPackageObject) {
  pOutdatedObject = pOutdatedObject.length <= 0 ? {} : JSON.parse(pOutdatedObject)
  const lOutdatedObject = core.filterOutdatedPackages(pOutdatedObject, pPackageObject)

  if (Object.keys(pOutdatedObject).length <= 0) {
    return {
      OK: true,
      message: '  Up\'em says: Everything seems to be up to date already.\n\n'
    }
  }

  if (Object.keys(lOutdatedObject).length <= 0) {
    return {
      OK: true,
      message: '  Up\'em says: Everything not in \'upem.donotup\' seems to be up to date already.\n\n'
    }
  }

  return {
    OK: true,
    outdatedObject: lOutdatedObject
  }
}

module.exports = (pPackageInputFileName, pOutdatedObject, pPackageOutputFileName = pPackageInputFileName, pOptions) => {
  try {
    const lPackageFile = fs.readFileSync(pPackageInputFileName)
    const lPackageObject = JSON.parse(lPackageFile)

    const lOutdatedResult = determineOutdated(pOutdatedObject, lPackageObject)
    if (!lOutdatedResult.outdatedObject) {
      return lOutdatedResult
    }

    try {
      fs.writeFileSync(pPackageOutputFileName, JSON.stringify(core.updateAllDeps(lPackageObject, lOutdatedResult.outdatedObject, pOptions), null, 2))
      return {
        OK: true,
        message: `  Up'em just updated all outdated dependencies in package.json to latest:\n\n    ${Object.keys(lOutdatedResult.outdatedObject).join(', ')}\n\n`
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
