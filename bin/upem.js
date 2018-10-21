#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const up = require('../src')
const readFromStream = require('../src/readFromStream')

const PACKAGE_FILE_NAME = path.join(process.cwd(), 'package.json')

try {
  const lPackageFile = fs.readFileSync(PACKAGE_FILE_NAME)
  let $package = JSON.parse(lPackageFile)

  readFromStream().then(pInput => {
    if (pInput.length > 0) {
      const gOutdatedObject = up.filterOutdatedPackages(JSON.parse(pInput), $package)

      try {
        fs.writeFileSync(
          PACKAGE_FILE_NAME,
          JSON.stringify(up.updateAllDeps($package, gOutdatedObject), null, 2)
        )
        process.stdout.write('  Up\'em just updated all dependencies in package.json to latest\n\n')
      } catch (e) {
        process.stderr.write(`  Up'em encountered a hitch when updating package.json:\n${e}\n\n`)
      }
    } else {
      process.stdout.write(`  Up'em says: Everything seems to be up to date already.\n\n`)
    }
  }).catch(pError => {
    process.stderr.write(`  Up'em encountered a hitch when reading outdated information:\n${pError}\n\n`)
  })
} catch (e) {
  process.stderr.write(`  Up'em encountered a hitch when reading stuff:\n${e}\n\n`)
}
