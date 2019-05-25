# Up'em
*Ups your package.json dependencies to latest. Opinionated. Respectless.*

[![Build Status](https://travis-ci.org/sverweij/upem.svg?branch=master)](https://travis-ci.org/sverweij/upem)
[![Maintainability](https://api.codeclimate.com/v1/badges/ecd08465c81bc85b83fe/maintainability)](https://codeclimate.com/github/sverweij/upem/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/ecd08465c81bc85b83fe/test_coverage)](https://codeclimate.com/github/sverweij/upem/test_coverage)
[![npm stable version](https://img.shields.io/npm/v/upem.svg)](https://npmjs.com/package/upem)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)


## What
You brush your teeth every day. You keep your dependencies up to date.
Brushing your teeth is hard to automate. Keeping dependencies up to date
is not.

_up'em_ updates your dependencies to latest, so you don't have to manually.


### Respectless
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

### Heeding `save-exact` and `save-prefix`, though
From version 2.0.0 _up'em_ heeds the `save-exact` and `save-prefix` npm config
settings, just like `npm --save` and `npm --save-dev` would do:
- if `save-exact = true` it will pin the version. In the above example it will
  pin `midash` to `2.0.1`
- if `save-exact = false` it will look at `save-prefix` in your npm config:
  - if `save-prefix = '^'` or save-prefix isn't specified, it'll caret-prefix
    the version: `^2.0.1`
  - if `save-prefix = '~'` it'll tilde-prefix the version: `~2.0.1`


### Advice: commit an `.npmrc` to the root of your repo
Commit the relevant parts of the npm config in an `.npmrc` in the root of your
repo. That way both _up'em_ and the `npm` (or `yarn`) install/ add commands
will always heed it - and other collaborators will automatically follow your
standards. E.g. most of my repos have this:

```ini
save-exact = true
```

If you want to be sure of npm's 'default' behaviour over all machines
and collaborators, use this one:

```ini
save-exact = false
save-prefix = '^'
```

## Typical use
- Run the output from `npm outdated --json` through _up'em_. 
- When it's done `npm install` and re-run your automated quality 
- Check the changes in.

I have some npm scripts set up so I can just `npm run upem`
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
    "donotup": ["glowdash"]
  }
  ...
```

You might want to document why you don't up a package. You can do that like this:
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
  need something more feature rich and less opinionated and don't mind the outdated
  (/ insecure) dependencies.
- [npm-check](https://github.com/dylang/npm-check) - never used but has a lot of stars
  & downloads, so probably legit. Feature rich.
- Cloud services (like [greenkeeper](https://greenkeeper.io) and 
  [renovate](https://renovatebot.com)) will be happy to do this 
  trivial task for you as well.

