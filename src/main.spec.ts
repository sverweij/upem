/* eslint-disable max-lines */
import { strictEqual, match, deepStrictEqual } from "node:assert";
import { fileURLToPath } from "node:url";
import { rmSync, chmodSync, readFileSync, existsSync } from "node:fs";
import { EOL } from "node:os";
import { join } from "node:path";
import upem from "./main.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

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

describe("main", () => {
  after(() => {
    rmSync(join(__dirname, "tmp_package-out.json"), {
      force: true,
      maxRetries: 3,
    });
  });

  it("non-existing package.json errors", () => {
    const lResult = upem("thisfiledoesnotexist", "");

    strictEqual(lResult.OK, false);
    match(lResult.message, /Up'em encountered a hitch:/);
  });

  it('empty string dependency JSON yields "nothing to update"', () => {
    const lResult = upem(join(__dirname, "__mocks__", "package-in.json"), "");

    strictEqual(lResult.OK, true);
    match(
      lResult.message,
      /Up'em says: Everything seems to be up to date already./
    );
  });

  it('{} dependency JSON yields "nothing to update"', () => {
    const lResult = upem(join(__dirname, "__mocks__", "package-in.json"), "{}");

    strictEqual(lResult.OK, true);
    match(
      lResult.message,
      /Up'em says: Everything seems to be up to date already./
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
    const READONLY_INPUT_FILENAME = join(
      __dirname,
      "__mocks__",
      "package-in-readonly.json"
    );

    chmodSync(READONLY_INPUT_FILENAME, "400");
    const lResult = upem(READONLY_INPUT_FILENAME, lOutdatedJson);

    strictEqual(lResult.OK, false);
    match(
      lResult.message,
      /Up'em encountered a hitch when updating package.json:/
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
    const lResult = upem(
      join(__dirname, "__mocks__", "package-in.json"),
      lOutdatedJson
    );

    strictEqual(lResult.OK, true);
    match(
      lResult.message,
      /Up'em found these packages were outdated, but did not update them because of policies/
    );
    match(lResult.message, /ts-jest {2}1.8.2 {3}\(policy: pin\)/);
  });

  it("happy day: dependencies updated with stuff in an outdated.json", () => {
    const OUTDATED_JSON = readFileSync(
      join(__dirname, "__mocks__", "outdated.json")
    );
    const INPUT_FILENAME = join(__dirname, "__mocks__", "package-in.json");
    const OUTPUT_FILENAME = join(__dirname, "tmp_package-out.json");
    const FIXTURE_FILENAME = join(
      __dirname,
      "__fixtures__",
      "package-out.json"
    );

    const lResult = upem(INPUT_FILENAME, OUTDATED_JSON, OUTPUT_FILENAME, {
      saveExact: true,
    });

    strictEqual(lResult.OK, true);
    match(
      lResult.message,
      /Up'em just updated these outdated dependencies in package.json:/
    );
    strictEqual(
      lResult.message.includes(
        `@types/node         10.5.1   -> 10.5.2   (policy: latest)${EOL}` +
          `dependency-cruiser  4.1.0    -> 4.1.1    (policy: latest)${EOL}` +
          `jest                23.2.0   -> 23.3.0   (policy: latest)${EOL}` +
          `webpack             4.14.0   -> 4.15.1   (policy: latest)`
      ),
      true
    );
    deepStrictEqual(
      JSON.parse(readFileSync(OUTPUT_FILENAME)),
      JSON.parse(readFileSync(FIXTURE_FILENAME))
    );
  });

  it("happy day: don't up peerDependencies when told not to", () => {
    const INPUT_FILENAME = join(
      __dirname,
      "__mocks__",
      "package-in-with-peer-deps.json"
    );
    const OUTPUT_FILENAME = join(__dirname, "tmp_package-out.json");
    const FIXTURE_FILENAME = join(
      __dirname,
      "__fixtures__",
      "package-out-with-peer-deps-not-updated.json"
    );

    const lResult = upem(INPUT_FILENAME, OUTDATED, OUTPUT_FILENAME, {
      saveExact: true,
      skipDependencyTypes: ["peerDependencies"],
    });

    strictEqual(lResult.OK, true);
    match(
      lResult.message,
      /Up'em just updated these outdated dependencies in package.json/
    );
    strictEqual(
      lResult.message.includes(
        `prod-dep          1.2.3   -> 1.3.0   (policy: latest)${EOL}` +
          `prod-dep-two      4.5.6   -> 5.0.0   (policy: latest)${EOL}` +
          `dev-dep           1.2.3   -> 1.3.0   (policy: latest)${EOL}` +
          `dev-and-peer-dep  4.5.6   -> 4.6.0   (policy: latest)${EOL}` +
          `peer-only-dep     4.8.1   -> 4.9.0   (policy: latest)${EOL}`
      ),
      true
    );
    deepStrictEqual(
      JSON.parse(readFileSync(OUTPUT_FILENAME)),
      JSON.parse(readFileSync(FIXTURE_FILENAME))
    );
  });

  it("happy day: do up peerDependencies when not told not to", () => {
    const INPUT_FILENAME = join(
      __dirname,
      "__mocks__",
      "package-in-with-peer-deps.json"
    );
    const OUTPUT_FILENAME = join(__dirname, "tmp_package-out.json");
    const FIXTURE_FILENAME = join(
      __dirname,
      "__fixtures__",
      "package-out-with-peer-deps-updated.json"
    );

    const lResult = upem(INPUT_FILENAME, OUTDATED, OUTPUT_FILENAME, {
      saveExact: true,
    });

    strictEqual(lResult.OK, true);
    match(
      lResult.message,
      /Up'em just updated these outdated dependencies in package.json/
    );
    strictEqual(
      lResult.message.includes(
        `prod-dep          1.2.3   -> 1.3.0   (policy: latest)${EOL}` +
          `prod-dep-two      4.5.6   -> 5.0.0   (policy: latest)${EOL}` +
          `dev-dep           1.2.3   -> 1.3.0   (policy: latest)${EOL}` +
          `dev-and-peer-dep  4.5.6   -> 4.6.0   (policy: latest)${EOL}` +
          `peer-only-dep     4.8.1   -> 4.9.0   (policy: latest)`
      ),
      true
    );
    deepStrictEqual(
      JSON.parse(readFileSync(OUTPUT_FILENAME)),
      JSON.parse(readFileSync(FIXTURE_FILENAME))
    );
  });

  it("happy day: don't up pin-policied packages, but do show them in the output", () => {
    const INPUT_FILENAME = join(
      __dirname,
      "__mocks__",
      "package-in-with-donotup-object.json"
    );
    const OUTPUT_FILENAME = join(__dirname, "tmp_package-out.json");
    const FIXTURE_FILENAME = join(
      __dirname,
      "__fixtures__",
      "package-out.json"
    );
    const lOutdated = readFileSync(
      join(__dirname, "__mocks__", "outdated.json")
    );

    const lResult = upem(INPUT_FILENAME, lOutdated, OUTPUT_FILENAME, {
      saveExact: true,
    });

    strictEqual(lResult.OK, true);
    match(
      lResult.message,
      /Up'em just updated these outdated dependencies in package.json/
    );
    strictEqual(
      lResult.message.includes(
        `@types/node         10.5.1   -> 10.5.2   (policy: latest)${EOL}` +
          `dependency-cruiser  4.1.0    -> 4.1.1    (policy: latest)${EOL}` +
          `jest                23.2.0   -> 23.3.0   (policy: latest)${EOL}` +
          `webpack             4.14.0   -> 4.15.1   (policy: latest)`
      ),
      true
    );
    match(
      lResult.message,
      /Up'em found these packages were outdated, but did not update them because of policies/
    );
    match(lResult.message, /ts-jest {13}2.0.0 {4}\(policy: pin\)/);
    deepStrictEqual(
      JSON.parse(readFileSync(OUTPUT_FILENAME)),
      JSON.parse(readFileSync(FIXTURE_FILENAME))
    );
  });

  it("if 'type' field is available - print it", () => {
    const INPUT_FILENAME = join(
      __dirname,
      "__mocks__",
      "package-in-with-donotup-object.json"
    );
    const OUTPUT_FILENAME = join(__dirname, "tmp_package-out.json");
    const FIXTURE_FILENAME = join(
      __dirname,
      "__fixtures__",
      "package-out.json"
    );
    const lOutdated = readFileSync(
      join(__dirname, "__mocks__", "outdated-long.json")
    );

    const lResult = upem(INPUT_FILENAME, lOutdated, OUTPUT_FILENAME, {
      saveExact: true,
    });

    strictEqual(lResult.OK, true);
    match(
      lResult.message,
      /Up'em just updated these outdated dependencies in package.json/
    );
    strictEqual(
      lResult.message.includes(
        `@types/node         10.5.1   -> 10.5.2  devDependencies   (policy: latest)${EOL}` +
          `dependency-cruiser  4.1.0    -> 4.1.1   devDependencies   (policy: latest)${EOL}` +
          `jest                23.2.0   -> 23.3.0  devDependencies   (policy: latest)${EOL}` +
          `webpack             4.14.0   -> 4.15.1  dependencies      (policy: latest)`
      ),
      true
    );
    match(
      lResult.message,
      /Up'em found these packages were outdated, but did not update them because of policies/
    );
    match(
      lResult.message,
      /ts-jest {13}2.0.0 {3}devDependencies {3}\(policy: pin\)/
    );
    deepStrictEqual(
      JSON.parse(readFileSync(OUTPUT_FILENAME)),
      JSON.parse(readFileSync(FIXTURE_FILENAME))
    );
  });

  it("doesn't update the specified manifest when dryRun is specified and true", () => {
    const INPUT_FILENAME = join(
      __dirname,
      "__mocks__",
      "package-in-with-donotup-object.json"
    );
    const OUTPUT_FILENAME = join(
      __dirname,
      "tmp_this-file-should-not-be-created.json"
    );
    const lOutdated = readFileSync(
      join(__dirname, "__mocks__", "outdated.json")
    );
    upem(INPUT_FILENAME, lOutdated, OUTPUT_FILENAME, { dryRun: true });
    strictEqual(existsSync(OUTPUT_FILENAME), false);
  });
});