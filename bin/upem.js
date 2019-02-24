#!/usr/bin/env node
const path = require('path')
const libNpmConfig = require('libnpmconfig')
const up = require('../src')
const readFromStream = require('../src/readFromStream')

const PACKAGE_FILE_NAME = path.join(process.cwd(), 'package.json')

readFromStream()
  .then(pOutdatedObject => {
    const lResult = up(
      PACKAGE_FILE_NAME,
      pOutdatedObject,
      PACKAGE_FILE_NAME,
      {
        saveExact: libNpmConfig.read().get('save-exact') || false,
        savePrefix: libNpmConfig.read().get('save-prefix') || '^'
      }
    )

    if (lResult.OK) {
      process.stdout.write(lResult.message)
    } else {
      process.stderr.write(lResult.message)
    }
  })
  .catch(pError => {
    process.stderr.write(`  Up'em encountered a hitch when reading outdated information:\n${pError}\n\n`)
  })
