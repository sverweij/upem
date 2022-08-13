import { updateDependencyKey, determineSavePrefix } from "./update-manifest.js";
import { determinePolicies } from "./determine-policies.js";

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
const OUTDATED_NO_POLICIES_FIXTURE = determinePolicies(OUTDATED_FIXTURE, []);
const OUTDATED_WANTED_POLICIES_FIXTURE = determinePolicies(OUTDATED_FIXTURE, [
  { package: "outdated-one", policy: "wanted" },
]);

const DEPS_CARET_FIXTURE = {
  "not-outdated": "1.0.0",
  "outdated-one": "^2.0.0",
  "outdated-possibly-pinned": "3.1.4",
};
const DEPS_CARET_UPDATED_LATEST_FIXTURE = {
  "not-outdated": "1.0.0",
  "outdated-one": "^3.0.2",
  "outdated-possibly-pinned": "4.1.1",
};
const DEPS_CARET_UPDATED_WANTED_FIXTURE = {
  "not-outdated": "1.0.0",
  "outdated-one": "^2.0.1",
  "outdated-possibly-pinned": "4.1.1",
};

describe("updateManifest - updateDependencyKey", () => {
  it("empty deps, no outdated yield input", () => {
    expect(updateDependencyKey({}, [])).toStrictEqual({});
  });
  it("deps, no outdated yield input", () => {
    expect(updateDependencyKey(DEPS_FIXTURE, [])).toStrictEqual(DEPS_FIXTURE);
  });
  it("deps, outdated yields updated deps, prefixed with carets", () => {
    expect(
      updateDependencyKey(DEPS_FIXTURE, OUTDATED_NO_POLICIES_FIXTURE)
    ).toStrictEqual(DEPS_UPDATED_CARET_FIXTURE);
  });
  it("deps, outdated with saveExact yields updated deps, pinned", () => {
    expect(
      updateDependencyKey(DEPS_FIXTURE, OUTDATED_NO_POLICIES_FIXTURE, {
        saveExact: true,
      })
    ).toStrictEqual(DEPS_UPDATED_PINNED_FIXTURE);
  });
  it("deps, outdated with saveExact yields updated deps, pinned even when savePrefix ^ is provided", () => {
    expect(
      updateDependencyKey(DEPS_FIXTURE, OUTDATED_NO_POLICIES_FIXTURE, {
        saveExact: true,
        savePrefix: "^",
      })
    ).toStrictEqual(DEPS_UPDATED_PINNED_FIXTURE);
  });
  it("deps, outdated with saveExact false yields updated deps, caret prefixed", () => {
    expect(
      updateDependencyKey(DEPS_FIXTURE, OUTDATED_NO_POLICIES_FIXTURE, {
        saveExact: false,
      })
    ).toStrictEqual(DEPS_UPDATED_CARET_FIXTURE);
  });
  it("deps, outdated with savePrefix ~ yields updated deps, tilde prefixed", () => {
    expect(
      updateDependencyKey(DEPS_FIXTURE, OUTDATED_NO_POLICIES_FIXTURE, {
        savePrefix: "~",
      })
    ).toStrictEqual(DEPS_UPDATED_TILDE_FIXTURE);
  });
  it("deps, outdated with individual prefix, and saveExact: true, updates to latest and leaves prefix in place", () => {
    expect(
      updateDependencyKey(DEPS_CARET_FIXTURE, OUTDATED_NO_POLICIES_FIXTURE, {
        saveExact: true,
      })
    ).toStrictEqual(DEPS_CARET_UPDATED_LATEST_FIXTURE);
  });
  it("updates those with a 'wanted' policy to wanted", () => {
    expect(
      updateDependencyKey(
        DEPS_CARET_FIXTURE,
        OUTDATED_WANTED_POLICIES_FIXTURE,
        { saveExact: true }
      )
    ).toStrictEqual(DEPS_CARET_UPDATED_WANTED_FIXTURE);
  });
});

describe("updateManifest - determineSavePrefix", () => {
  it("without options, regardless, returns ^ (no prefix case)", () => {
    expect(determineSavePrefix("0.0.0")).toBe("^");
  });
  it("without options, regardless, returns ^ (>= case)", () => {
    expect(determineSavePrefix(">=0.0.0")).toBe("^");
  });
  it("with only saveExact = false, returns ^ as a prefix", () => {
    expect(determineSavePrefix(">=0.0.0", { saveExact: false })).toBe("^");
  });
  it("with saveExact = false and a savePrefix, returns that savePrefix", () => {
    expect(
      determineSavePrefix(">=0.0.0", { saveExact: false, savePrefix: "~" })
    ).toBe("~");
  });
  it("with only saveExact = true, and an individual prefix returns that prefix", () => {
    expect(determineSavePrefix(">=0.0.0", { saveExact: true })).toBe(">=");
  });
  it("with only saveExact = true, and no individual prefix returns empty string", () => {
    expect(determineSavePrefix("0.0.0", { saveExact: true })).toBe("");
  });
});
