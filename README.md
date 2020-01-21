<img width="640" alt="Up'em" src="https://raw.githubusercontent.com/sverweij/upem/master/docs/assets/upem-social-card.png">

**Up'em** updates your dependencies to **latest**, so you don't have to.

## Use

- Pipe `npm outdated --json` through `upem`.
- When it's done `npm install` and re-run your automated quality checks.
- Done.

## Sample

You can e.g. set up some npm scripts so you can `npm run upem`
and watch cat videos in the mean time:

```json
  "scripts": {
    "check": "npm-run-all --parallel lint lint:archi test",
    "lint": "eslint src test",
    "lint:archi": "depcruise --validate -- src test",
    "lint:fix": "eslint --fix src test",
    "test": "jest",
    "upem": "npm-run-all upem:update upem:install lint:fix check",
    "upem:update": "npm outdated --json | upem",
    "upem:install": "npm install"
  }
```

A similar approach in a `Makefile`, `gulpfile.js` or `Gruntfile` would
do the trick as well.

## Options

If you want to keep versions untouched by _up'em_, put an `upem` section
in your `package.json` with a `donotup` key, listing the stuff you don't
want to upgrade e.g.

```json
  ...
  "upem": {
    "donotup": [{
      "package": "glowdash",
      "because": "version >2 of glowdash doesn't support node 6 anymmore, but we still have to"
    }]
  }
  ...
```

## So what's this _opionated and respectless_ business?

### Latest is best

_up'em_ does not respect your current version preferences. `^`, `~`, `*` =>
they all get updated to the _latest_ version. It will leave the `^` and `~`
in place as per your `npm config` settings, though.

If `npm outdated` says:

```
Package    Current  Wanted  Latest  Location
midash       1.8.2  ^1.8.0   2.0.1  your-golden-package
```

With the default `npm config`, running `npm outdated --json | upem` will
set midash' version to ^2.0.1

```json
"dependencies"{
  ...
  "midash": "^2.0.1"
  ...
}
```

There's no warning system for major version upgrades. I've found the most
reliable way to find out if nothing breaks is to run your automated QA
after updates.

### Still respecting _save-exact_ and _save-prefix_

_Up'em_ does respect the `save-exact` and `save-prefix` npm config
settings, just like `npm --save` and `npm --save-dev` would do:

- if `save-exact = true` it will pin the version. In the above example it will
  pin `midash` to `2.0.1`
- if `save-exact = false` it will look at `save-prefix` in your npm config:
  - if `save-prefix = '^'` or save-prefix isn't specified, it'll caret-prefix
    the version: `^2.0.1`
  - if `save-prefix = '~'` it'll tilde-prefix the version: `~2.0.1`

If you want to be sure of npm's 'default' behaviour over all machines
and collaborators, use this one:

```ini
save-exact = false
save-prefix = '^'
```

Whatever your preferences: commit a `.npmrc` at the root of all your repos so
npm, yarn and upem behavior is the same accross all machines and collaborators.

## Why?

I've been a happy user of [npm-check-updates](https://github.com/tjunnone/npm-check-updates)
for a long time. It's getting out of date, though. It's using npm 3 (which has not caused
troubles yet, but it might) and its dependencies have serious security issues.
I have been looking into jumping into fixing it, but I soon found out it would take
a serious commitment to do so.

I realized I used only a subset of npm-check-updates' capabilities, and rolling
my own would only take a sunday afternoon...

## Alternatives

- If you're using [yarn](https://yarnpkg.com) and its lock feature you should probably look into using the
  [yarn upgrade --latest](https://yarnpkg.com/lang/en/docs/cli/upgrade/) or
  [yarn upgrade-interactive --latest](https://yarnpkg.com/lang/en/docs/cli/upgrade-interactive/) commands.
- [npm-check-updates](https://github.com/tjunnone/npm-check-updates) - use that if you
  need something more feature rich and less opinionated and don't mind the outdated
  (/ insecure) dependencies.
- [npm-check](https://github.com/dylang/npm-check) - never used but has a lot of stars
  & downloads, so probably legit. Feature rich.
- Cloud services (like [greenkeeper](https://greenkeeper.io) and
  [renovate](https://renovatebot.com)) will be happy to do this
  trivial task for you as well.

## Flare

[![Build Status](https://travis-ci.org/sverweij/upem.svg?branch=master)](https://travis-ci.org/sverweij/upem)
[![Maintainability](https://api.codeclimate.com/v1/badges/ecd08465c81bc85b83fe/maintainability)](https://codeclimate.com/github/sverweij/upem/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/ecd08465c81bc85b83fe/test_coverage)](https://codeclimate.com/github/sverweij/upem/test_coverage)
[![npm stable version](https://img.shields.io/npm/v/upem.svg)](https://npmjs.com/package/upem)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
