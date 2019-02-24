const fs = require('fs')
const path = require('path')
const up = require('../src')

describe('#upppity', () => {
  test('non-existing package.json errors', () => {
    const lResult = up('thisfiledoesnotexist', '')
    expect(lResult.OK).toEqual(false)
    expect(lResult.message).toContain(`Up'em encountered a hitch:`)
  })

  test('empty string dependency JSON yields "nothing to update"', () => {
    const lResult = up(path.join(__dirname, 'package-in.json'), '')
    expect(lResult.OK).toEqual(true)
    expect(lResult.message).toContain(`Up'em says: Everything seems to be up to date already.`)
  })

  test('{} dependency JSON yields "nothing to update"', () => {
    const lResult = up(path.join(__dirname, 'package-in.json'), '{}')
    expect(lResult.OK).toEqual(true)
    expect(lResult.message).toContain(`Up'em says: Everything seems to be up to date already.`)
  })

  test(`read only package.json yields a 'can't update`, () => {
    const OUTDATED_JSON = `
    {
      "lodash.assign": {
        "current": "4.2.0",
        "wanted": "4.2.0",
        "latest": "4.2.1",
        "location": "node_modules/lodash.assign"
      }
    }
    `
    const READONLY_INPUT_FILENAME = path.join(__dirname, 'package-in-readonly.json')
    fs.chmodSync(READONLY_INPUT_FILENAME, '400')
    const lResult = up(READONLY_INPUT_FILENAME, OUTDATED_JSON)
    expect(lResult.OK).toEqual(false)
    expect(lResult.message).toContain(`Up'em encountered a hitch when updating package.json:`)
  })

  test('if upem.donotup encompasses the outdated object yields that in a message', () => {
    const OUTDATED_JSON = `
    {
      "ts-jest": {
        "current": "1.8.2",
        "wanted": "1.8.2",
        "latest": "2.0.0",
        "location": "node_modules/ts-jest"
      }
    }
    `
    const lResult = up(path.join(__dirname, 'package-in.json'), OUTDATED_JSON)
    expect(lResult.OK).toEqual(true)
    expect(lResult.message).toContain(`Up'em says: Everything not in 'upem.donotup' seems to be up to date already.`)
  })

  test('happy day: dependencies updated with stuff in an outdated.json', () => {
    const OUTDATED_JSON = fs.readFileSync(path.join(__dirname, 'outdated.json'))
    const INPUT_FILENAME = path.join(__dirname, 'package-in.json')
    const OUTPUT_FILENAME = path.join(__dirname, 'tmp_package-out.json')
    const FIXTURE_FILENAME = path.join(__dirname, 'package-out.json')

    const lResult = up(INPUT_FILENAME, OUTDATED_JSON, OUTPUT_FILENAME, { saveExact: true })

    expect(lResult.OK).toEqual(true)
    expect(lResult.message).toContain(`Up'em just updated all dependencies in package.json to latest`)
    expect(JSON.parse(fs.readFileSync(OUTPUT_FILENAME))).toEqual(JSON.parse(fs.readFileSync(FIXTURE_FILENAME)))
  })
})

/* global describe, test, expect */
