import {
  determineSavePrefix,
  getPolicyOverrides,
} from "../src/core-helpers.js";

describe("#core-helpers - determineSavePrefix", () => {
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

describe("#core-helpers - getPolicyOverrides", () => {
  it("returns an empty array when theres's no upem section in package.json", () => {
    expect(getPolicyOverrides({}, "pin")).toStrictEqual([]);
  });
  it("returns an empty array when theres's an empty upem section in package.json", () => {
    expect(getPolicyOverrides({ upem: {} }, "pin")).toStrictEqual([]);
  });
  it("returns an empty array when theres's an upem section with an empty policy array in package.json", () => {
    expect(getPolicyOverrides({ upem: { policies: [] } }, "pin")).toStrictEqual(
      []
    );
  });
  it("returns an empty array when the policy to filter isn't in the policy array", () => {
    expect(
      getPolicyOverrides(
        { upem: { policies: [{ package: "ewok", policy: "wanted" }] } },
        "pin"
      )
    ).toStrictEqual([]);
  });
  it("returns an array of 1 when there's 1 package with the policy to filter in the policy array", () => {
    expect(
      getPolicyOverrides(
        {
          upem: {
            policies: [
              { package: "yaryar", policy: "pin" },
              { package: "binks", policy: "wanted" },
            ],
          },
        },
        "pin"
      )
    ).toStrictEqual(["yaryar"]);
  });
  it("returns an array of 2 when there's 2 package with the policy to filter in the policy array", () => {
    expect(
      getPolicyOverrides(
        {
          upem: {
            policies: [
              { package: "yaryar", policy: "pin" },
              { package: "binks", policy: "pin" },
            ],
          },
        },
        "pin"
      )
    ).toStrictEqual(["yaryar", "binks"]);
  });
});
