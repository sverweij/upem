import { deepStrictEqual } from "node:assert";
import { determinePolicies } from "./determine-policies.js";

describe("determinePolicies", () => {
  it("when there's no outdated there's an empty array of policies", () => {
    deepStrictEqual(determinePolicies({}, []), []);
  });

  it("adds policy related attributes & transforms it into an array", () => {
    const lSomeOutdated = {
      "@types/node": {
        current: "10.5.1",
        wanted: "10.5.1",
        latest: "10.5.2",
        location: "node_modules/@types/node",
      },
    };
    deepStrictEqual(determinePolicies(lSomeOutdated, []), [
      {
        current: "10.5.1",
        wanted: "10.5.1",
        latest: "10.5.2",
        location: "node_modules/@types/node",
        package: "@types/node",
        policy: "latest",
        target: "10.5.2",
      },
    ]);
  });
});
