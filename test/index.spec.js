import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import up from "../src/index.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

describe("#upem", () => {
  it("non-existing package.json errors", () => {
    const lResult = up("thisfiledoesnotexist", "");

    expect(lResult.OK).toBe(false);
    expect(lResult.message).toContain("Up'em encountered a hitch:");
  });

  it('empty string dependency JSON yields "nothing to update"', () => {
    const lResult = up(path.join(__dirname, "package-in.json"), "");

    expect(lResult.OK).toBe(true);
    expect(lResult.message).toContain(
      "Up'em says: Everything seems to be up to date already."
    );
  });

  it('{} dependency JSON yields "nothing to update"', () => {
    const lResult = up(path.join(__dirname, "package-in.json"), "{}");

    expect(lResult.OK).toBe(true);
    expect(lResult.message).toContain(
      "Up'em says: Everything seems to be up to date already."
    );
  });

  it("read only package.json yields a 'can't update", () => {
    const lOutdatedJson = `
    {
      "lodash.assign": {
        "current": "4.2.0",
        "wanted": "4.2.0",
        "latest": "4.2.1",
        "location": "node_modules/lodash.assign"
      }
    }
    `;
    const READONLY_INPUT_FILENAME = path.join(
      __dirname,
      "package-in-readonly.json"
    );

    fs.chmodSync(READONLY_INPUT_FILENAME, "400");
    const lResult = up(READONLY_INPUT_FILENAME, lOutdatedJson);

    expect(lResult.OK).toBe(false);
    expect(lResult.message).toContain(
      "Up'em encountered a hitch when updating package.json:"
    );
  });

  it("if upem.donotup encompasses the outdated object yields that in a message", () => {
    const lOutdatedJson = `
    {
      "ts-jest": {
        "current": "1.8.2",
        "wanted": "1.8.2",
        "latest": "2.0.0",
        "location": "node_modules/ts-jest"
      }
    }
    `;
    const lResult = up(path.join(__dirname, "package-in.json"), lOutdatedJson);

    expect(lResult.OK).toBe(true);
    expect(lResult.message).toContain(
      "Up'em says: Everything not pinned in 'upem.policies' seems to be up to date already."
    );
  });

  it("happy day: dependencies updated with stuff in an outdated.json", () => {
    const OUTDATED_JSON = fs.readFileSync(
      path.join(__dirname, "outdated.json")
    );
    const INPUT_FILENAME = path.join(__dirname, "package-in.json");
    const OUTPUT_FILENAME = path.join(__dirname, "tmp_package-out.json");
    const FIXTURE_FILENAME = path.join(__dirname, "package-out.json");

    const lResult = up(INPUT_FILENAME, OUTDATED_JSON, OUTPUT_FILENAME, {
      saveExact: true,
    });

    expect(lResult.OK).toBe(true);
    expect(lResult.message).toContain(
      "Up'em just updated all outdated dependencies in package.json to latest"
    );
    expect(lResult.message).toContain(
      "@types/node, dependency-cruiser, jest, webpack"
    );
    expect(JSON.parse(fs.readFileSync(OUTPUT_FILENAME))).toStrictEqual(
      JSON.parse(fs.readFileSync(FIXTURE_FILENAME))
    );
  });

  it("happy day: don't up peerDependencies when told not to", () => {
    const OUTDATED = JSON.stringify({
      "prod-dep": {
        current: "1.2.3",
        wanted: "1.2.3",
        latest: "1.3.0",
        location: "node_modules/prod-dep",
      },
      "prod-dep-two": {
        current: "4.5.6",
        wanted: "4.5.6",
        latest: "5.0.0",
        location: "node_modules/prod-dep-two",
      },
      "dev-dep": {
        current: "1.2.3",
        wanted: "1.2.3",
        latest: "1.3.0",
        location: "node_modules/dev-dep",
      },
      "dev-and-peer-dep": {
        current: "4.5.6",
        wanted: "4.5.6",
        latest: "4.6.0",
        location: "node_modules/dev-and-peer-dep",
      },
      "peer-only-dep": {
        current: "4.8.1",
        wanted: ">=4.8.1",
        latest: "4.9.0",
        location: "node_modules/peer-only-dep",
      },
    });
    const INPUT_FILENAME = path.join(
      __dirname,
      "package-in-with-peer-deps.json"
    );
    const OUTPUT_FILENAME = path.join(__dirname, "tmp_package-out.json");
    const FIXTURE_FILENAME = path.join(
      __dirname,
      "package-out-with-peer-deps-not-updated.json"
    );

    const lResult = up(INPUT_FILENAME, OUTDATED, OUTPUT_FILENAME, {
      saveExact: true,
      skipDependencyTypes: ["peerDependencies"],
    });

    expect(lResult.OK).toBe(true);
    expect(lResult.message).toContain(
      "Up'em just updated all outdated dependencies in package.json to latest"
    );
    expect(lResult.message).toContain(
      "prod-dep, prod-dep-two, dev-dep, dev-and-peer-dep"
    );
    expect(JSON.parse(fs.readFileSync(OUTPUT_FILENAME))).toStrictEqual(
      JSON.parse(fs.readFileSync(FIXTURE_FILENAME))
    );
  });

  it("happy day: do up peerDependencies when not told not to", () => {
    const OUTDATED = JSON.stringify({
      "prod-dep": {
        current: "1.2.3",
        wanted: "1.2.3",
        latest: "1.3.0",
        location: "node_modules/prod-dep",
      },
      "prod-dep-two": {
        current: "4.5.6",
        wanted: "4.5.6",
        latest: "5.0.0",
        location: "node_modules/prod-dep-two",
      },
      "dev-dep": {
        current: "1.2.3",
        wanted: "1.2.3",
        latest: "1.3.0",
        location: "node_modules/dev-dep",
      },
      "dev-and-peer-dep": {
        current: "4.5.6",
        wanted: "4.5.6",
        latest: "4.6.0",
        location: "node_modules/dev-and-peer-dep",
      },
      "peer-only-dep": {
        current: "4.8.1",
        wanted: ">=4.8.1",
        latest: "4.9.0",
        location: "node_modules/peer-only-dep",
      },
    });
    const INPUT_FILENAME = path.join(
      __dirname,
      "package-in-with-peer-deps.json"
    );
    const OUTPUT_FILENAME = path.join(__dirname, "tmp_package-out.json");
    const FIXTURE_FILENAME = path.join(
      __dirname,
      "package-out-with-peer-deps-updated.json"
    );

    const lResult = up(INPUT_FILENAME, OUTDATED, OUTPUT_FILENAME, {
      saveExact: true,
    });

    expect(lResult.OK).toBe(true);
    expect(lResult.message).toContain(
      "Up'em just updated all outdated dependencies in package.json to latest"
    );
    expect(lResult.message).toContain(
      "prod-dep, prod-dep-two, dev-dep, dev-and-peer-dep, peer-only-dep"
    );
    expect(JSON.parse(fs.readFileSync(OUTPUT_FILENAME))).toStrictEqual(
      JSON.parse(fs.readFileSync(FIXTURE_FILENAME))
    );
  });
});
