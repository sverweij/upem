const up = require('../src')
const DEPS_FIXTURE = {
  'not-outdated': '1.0.0',
  'outdated-one': '2.0.0',
  'outdated-possibly-pinned': '3.1.4'
}
const DEPS_UPDATED_FIXTURE = {
  'not-outdated': '1.0.0',
  'outdated-one': '3.0.2',
  'outdated-possibly-pinned': '4.1.1'
}
const DEPS_UPDATED_MINUS_PINNED_FIXTURE = {
  'not-outdated': '1.0.0',
  'outdated-one': '3.0.2',
  'outdated-possibly-pinned': '3.1.4'
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
const PINNED_FIXTURE = ['outdated-possibly-pinned']

describe('#updateDeps', () => {
  test('empty deps, no outdated or pinned yield input', () => {
    expect(up.updateDeps({}, [], [])).toEqual({})
  })
  test('deps, no outdated or pinned yield input', () => {
    expect(up.updateDeps(DEPS_FIXTURE, {}, [])).toEqual(DEPS_FIXTURE)
  })
  test('deps, no outdated or pinned yield input', () => {
    expect(up.updateDeps(DEPS_FIXTURE, {}, PINNED_FIXTURE)).toEqual(DEPS_FIXTURE)
  })
  test('deps, outdated, no pinned yields updated deps', () => {
    expect(up.updateDeps(DEPS_FIXTURE, OUTDATED_FIXTURE, [])).toEqual(DEPS_UPDATED_FIXTURE)
  })
  test('deps, outdated, no pinned yields updated deps', () => {
    expect(up.updateDeps(DEPS_FIXTURE, OUTDATED_FIXTURE, PINNED_FIXTURE)).toEqual(DEPS_UPDATED_MINUS_PINNED_FIXTURE)
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

  test('empty package.json, several outdated yield input', () => {
    expect(
      up.updateAllDeps(
        require('./package-in.json'),
        require('./outdated.json')
      )
    ).toEqual(require('./package-out.json'))
  })
})
/* global describe, test, expect */
