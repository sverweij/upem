#!/usr/bin/env node
const path = require('path')
const up = require('../src')
const readFromStream = require('../src/readFromStream')

const PACKAGE_FILE_NAME = path.join(process.cwd(), 'package.json')

readFromStream()
  .then(pOutdatedObject => {
    const lResult = up(PACKAGE_FILE_NAME, pOutdatedObject)

    if (lResult.OK) {
      process.stdout.write(lResult.message)
    } else {
      process.stderr.write(lResult.message)
    }
  })
  .catch(pError => {
    process.stderr.write(`  Up'em encountered a hitch when reading outdated information:\n${pError}\n\n`)
  })
