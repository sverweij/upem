# Up'em
*Ups your package.json dependencies to latest. Opinionated. Respectless.*

[![Build Status](https://travis-ci.org/sverweij/upem.svg?branch=master)](https://travis-ci.org/sverweij/upem)
[![Maintainability](https://api.codeclimate.com/v1/badges/ecd08465c81bc85b83fe/maintainability)](https://codeclimate.com/github/sverweij/upem/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/ecd08465c81bc85b83fe/test_coverage)](https://codeclimate.com/github/sverweij/upem/test_coverage)
[![npm stable version](https://img.shields.io/npm/v/upem.svg)](https://npmjs.com/package/upem)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)


## What
You brush your teeth every day. And you keep your dependencies up to date.
Brushing your teeth is hard to automate. Keeping your dependencies up to date
is not.

_up'em_ updates your dependencies to latest, so you don't have to manually.

### Opinionated
After processing all versions are 'pinned'. Sure, you could use package-lock
for that too, sort of. But still if your package.json contains "^1.0.0" of
a package, do you know what you're using?

### Respectless
_up'em_ does not respect your current version preferences. `^`, `~`, `*` =>
they all get pinned.


If `npm outdated` says:
```
Package    Current  Wanted  Latest  Location
midash       1.8.2  ^1.8.0   2.0.1  your-golden-package
```

running `npm outdated --json | upem` will set midash' version to 2.0.1

```json
"dependencies"{
  ...
  "midash": "2.0.1"
  ...
}
```

There's no warning system for major version upgrades. I've found the most
reliable way to find out if nothing breaks is to run your automated QA
after updates.

## Typical use
You'd typically run the output from `npm outdated --json` through it. When it's done
`npm install` and re-run your automated quality checks before checking the
changes in. I have some npm scripts set up so I can just `npm run upem`
and watch cat videos in the mean time:

```json
  "scripts": {
    "check": "npm-run-all --parallel depcruise lint test",
    "depcruise": "depcruise --validate -- bin src test",
    "lint": "eslint bin src test",
    "lint:fix": "eslint --fix bin src test",
    "test": "jest --collectCoverage --config ./jest.config.js",
    "upem": "npm-run-all upem:update upem:install lint:fix check",
    "upem:update": "npm outdated --json | upem",
    "upem:install": "npm install"
  }
```

... but a similar approach in a `Makefile` would do the trick as well.

## Options
If you want to keep versions untouched by _up'em_, put an `upem` section
in your `package.json` with a `donotup` key listing the stuff you don't
want to upgrade e.g.

```json
  ...
  "upem": {
    "donotup": ["ts-jest"]
  }
  ...
```

## Why
I've been a happy user of [npm-check-updates](https://github.com/tjunnone/npm-check-updates)
for a long time. It's getting out of date, though. It's using npm 3 (which has not caused
troubles yet, but it might) and its dependencies have serious security issues.
I have been looking into jumping into fixing it, but I soon found out it would take
a serious commitment to do so.

I realized I used only a subset of npm-check-updates' capabilities, and rolling
my own would only take a sunday afternoon...

## Alternatives
- [npm-check-updates](https://github.com/tjunnone/npm-check-updates) - use that if you
  need something more feature rich and less opinionated.
- Cloud services (like [greenkeeper](https://greenkeeper.io) and 
  [renovate](https://renovatebot.com)) will be happy to do this 
  trivial task for you as well.

