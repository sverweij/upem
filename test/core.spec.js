const up = require('../src/core')
const DEPS_FIXTURE = {
  'not-outdated': '1.0.0',
  'outdated-one': '2.0.0',
  'outdated-possibly-pinned': '3.1.4'
}
const DEPS_UPDATED_PINNED_FIXTURE = {
  'not-outdated': '1.0.0',
  'outdated-one': '3.0.2',
  'outdated-possibly-pinned': '4.1.1'
}
const DEPS_UPDATED_CARET_FIXTURE = {
  'not-outdated': '1.0.0',
  'outdated-one': '^3.0.2',
  'outdated-possibly-pinned': '^4.1.1'
}
const DEPS_UPDATED_TILDE_FIXTURE = {
  'not-outdated': '1.0.0',
  'outdated-one': '~3.0.2',
  'outdated-possibly-pinned': '~4.1.1'
}
const OUTDATED_FIXTURE = {
  'outdated-one': {
    'current': '2.0.0',
    'wanted': '2.0.1',
    'latest': '3.0.2',
    'location': 'node_modules/not-outdated'
  },
  'outdated-possibly-pinned': {
    'current': '3.1.4',
    'wanted': '3.1.4',
    'latest': '4.1.1',
    'location': 'node_modules/outdated-possibly-pinned'
  }
}
describe('#updateDeps', () => {
  test('empty deps, no outdated yield input', () => {
    expect(up.updateDeps({}, [])).toEqual({})
  })
  test('deps, no outdated yield input', () => {
    expect(up.updateDeps(DEPS_FIXTURE, {})).toEqual(DEPS_FIXTURE)
  })
  test('deps, no outdated yield input', () => {
    expect(up.updateDeps(DEPS_FIXTURE, {})).toEqual(DEPS_FIXTURE)
  })
  test('deps, outdated yields updated deps, prefixed with carets', () => {
    expect(up.updateDeps(DEPS_FIXTURE, OUTDATED_FIXTURE)).toEqual(DEPS_UPDATED_CARET_FIXTURE)
  })
  test('deps, outdated with saveExact yields updated deps, pinned', () => {
    expect(up.updateDeps(DEPS_FIXTURE, OUTDATED_FIXTURE, { saveExact: true })).toEqual(DEPS_UPDATED_PINNED_FIXTURE)
  })
  test('deps, outdated with saveExact yields updated deps, pinned even when savePrefix ^ is provided', () => {
    expect(up.updateDeps(DEPS_FIXTURE, OUTDATED_FIXTURE, { saveExact: true, savePrefix: '^' })).toEqual(DEPS_UPDATED_PINNED_FIXTURE)
  })
  test('deps, outdated with saveExact false yields updated deps, caret prefixed', () => {
    expect(up.updateDeps(DEPS_FIXTURE, OUTDATED_FIXTURE, { saveExact: false })).toEqual(DEPS_UPDATED_CARET_FIXTURE)
  })
  test('deps, outdated with savePrefix ~ yields updated deps, tilde prefixed', () => {
    expect(up.updateDeps(DEPS_FIXTURE, OUTDATED_FIXTURE, { savePrefix: '~' })).toEqual(DEPS_UPDATED_TILDE_FIXTURE)
  })
})

describe('#updateAllDeps', () => {
  test('empty package.json, no outdated yield input', () => {
    expect(up.updateAllDeps({}, {})).toEqual({})
    expect(up.updateAllDeps({})).toEqual({})
  })

  test('empty package.json, several outdated yield input', () => {
    expect(up.updateAllDeps({}, ['aap', 'noot', 'mies'])).toEqual({})
  })

  test('real package.json, several outdated yield updated output', () => {
    expect(
      up.updateAllDeps(
        require('./package-in.json'),
        require('./outdated-filtered.json'),
        {
          saveExact: true
        }
      )
    ).toEqual(require('./package-out.json'))
  })
})

describe('#filterOutdatedPackages', () => {
  test('empty outdated + empty package => empty outdated', () => {
    expect(
      up.filterOutdatedPackages({}, {})
    ).toEqual({})
  })

  test('empty outdated + package => empty outdated', () => {
    expect(
      up.filterOutdatedPackages({}, require('./package-in.json'))
    ).toEqual({})
  })

  test('outdated + package with upem.donotup => outdated without the upem.donotup', () => {
    expect(
      up.filterOutdatedPackages(require('./outdated.json'), require('./package-in.json'))
    ).toEqual(require('./outdated-filtered.json'))
  })

  test('outdated + package with upem.donotup objects => outdated without the upem.donotup', () => {
    expect(
      up.filterOutdatedPackages(require('./outdated.json'), require('./package-in-with-donotup-object.json'))
    ).toEqual(require('./outdated-filtered.json'))
  })

  test('outdated + package with upem.donotup => outdated without the upem.donotup', () => {
    expect(
      up.filterOutdatedPackages(require('./outdated.json'), require('./package-in-without-upem-donotup.json'))
    ).toEqual(require('./outdated.json'))
  })

  test('outdated + package with upem.donotup => outdated with erroneous upem.donotup', () => {
    expect(
      up.filterOutdatedPackages(require('./outdated.json'), require('./package-in-with-erroneous-upem-donotup.json'))
    ).toEqual(require('./outdated.json'))
  })
})
/* global describe, test, expect */
