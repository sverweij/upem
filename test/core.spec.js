import { createRequire } from "module";
import up from "../src/core.js";

const require = createRequire(import.meta.url);

const DEPS_FIXTURE = {
  "not-outdated": "1.0.0",
  "outdated-one": "2.0.0",
  "outdated-possibly-pinned": "3.1.4",
};
const DEPS_UPDATED_PINNED_FIXTURE = {
  "not-outdated": "1.0.0",
  "outdated-one": "3.0.2",
  "outdated-possibly-pinned": "4.1.1",
};
const DEPS_UPDATED_CARET_FIXTURE = {
  "not-outdated": "1.0.0",
  "outdated-one": "^3.0.2",
  "outdated-possibly-pinned": "^4.1.1",
};
const DEPS_UPDATED_TILDE_FIXTURE = {
  "not-outdated": "1.0.0",
  "outdated-one": "~3.0.2",
  "outdated-possibly-pinned": "~4.1.1",
};
const OUTDATED_FIXTURE = {
  "outdated-one": {
    current: "2.0.0",
    wanted: "2.0.1",
    latest: "3.0.2",
    location: "node_modules/not-outdated",
  },
  "outdated-possibly-pinned": {
    current: "3.1.4",
    wanted: "3.1.4",
    latest: "4.1.1",
    location: "node_modules/outdated-possibly-pinned",
  },
};

describe("#updateDeps", () => {
  it("empty deps, no outdated yield input", () => {
    expect(up.updateDeps({}, [])).toStrictEqual({});
  });
  it("deps, no outdated yield input", () => {
    expect(up.updateDeps(DEPS_FIXTURE, {})).toStrictEqual(DEPS_FIXTURE);
  });
  it("deps, outdated yields updated deps, prefixed with carets", () => {
    expect(up.updateDeps(DEPS_FIXTURE, OUTDATED_FIXTURE)).toStrictEqual(
      DEPS_UPDATED_CARET_FIXTURE
    );
  });
  it("deps, outdated with saveExact yields updated deps, pinned", () => {
    expect(
      up.updateDeps(DEPS_FIXTURE, OUTDATED_FIXTURE, { saveExact: true })
    ).toStrictEqual(DEPS_UPDATED_PINNED_FIXTURE);
  });
  it("deps, outdated with saveExact yields updated deps, pinned even when savePrefix ^ is provided", () => {
    expect(
      up.updateDeps(DEPS_FIXTURE, OUTDATED_FIXTURE, {
        saveExact: true,
        savePrefix: "^",
      })
    ).toStrictEqual(DEPS_UPDATED_PINNED_FIXTURE);
  });
  it("deps, outdated with saveExact false yields updated deps, caret prefixed", () => {
    expect(
      up.updateDeps(DEPS_FIXTURE, OUTDATED_FIXTURE, { saveExact: false })
    ).toStrictEqual(DEPS_UPDATED_CARET_FIXTURE);
  });
  it("deps, outdated with savePrefix ~ yields updated deps, tilde prefixed", () => {
    expect(
      up.updateDeps(DEPS_FIXTURE, OUTDATED_FIXTURE, { savePrefix: "~" })
    ).toStrictEqual(DEPS_UPDATED_TILDE_FIXTURE);
  });
});

describe("#updateAllDeps", () => {
  it("empty package.json, no outdated yield input", () => {
    expect(up.updateAllDeps({}, {})).toStrictEqual({});
    expect(up.updateAllDeps({})).toStrictEqual({});
  });

  it("empty package.json, several outdated yield input", () => {
    expect(up.updateAllDeps({}, ["aap", "noot", "mies"])).toStrictEqual({});
  });

  it("real package.json, several outdated yield updated output", () => {
    expect(
      up.updateAllDeps(
        require("./package-in.json"),
        require("./outdated-filtered.json"),
        {
          saveExact: true,
        }
      )
    ).toStrictEqual(require("./package-out.json"));
  });
});

describe("#filterOutdatedPackages", () => {
  it("empty outdated + empty package => empty outdated", () => {
    expect(up.filterOutdatedPackages({}, {})).toStrictEqual({});
  });

  it("empty outdated + package => empty outdated", () => {
    expect(
      up.filterOutdatedPackages({}, require("./package-in.json"))
    ).toStrictEqual({});
  });

  it("outdated + package with upem.donotup => outdated without the upem.donotup", () => {
    expect(
      up.filterOutdatedPackages(
        require("./outdated.json"),
        require("./package-in.json")
      )
    ).toStrictEqual(require("./outdated-filtered.json"));
  });

  it("outdated + package with upem.donotup as a string => outdated without the upem.donotup", () => {
    expect(
      up.filterOutdatedPackages(
        require("./outdated.json"),
        require("./package-with-donotup-string.json")
      )
    ).toStrictEqual(require("./outdated-filtered.json"));
  });

  it("outdated + package with upem.donotup objects => outdated without the upem.donotup", () => {
    expect(
      up.filterOutdatedPackages(
        require("./outdated.json"),
        require("./package-in-with-donotup-object.json")
      )
    ).toStrictEqual(require("./outdated-filtered.json"));
  });

  it("outdated + package without upem.donotup => outdated without the upem.donotup", () => {
    expect(
      up.filterOutdatedPackages(
        require("./outdated.json"),
        require("./package-in-without-upem-donotup.json")
      )
    ).toStrictEqual(require("./outdated.json"));
  });

  it("outdated + package with upem.donotup => outdated with erroneous upem.donotup", () => {
    expect(
      up.filterOutdatedPackages(
        require("./outdated.json"),
        require("./package-in-with-erroneous-upem-donotup.json")
      )
    ).toStrictEqual(require("./outdated.json"));
  });
});
