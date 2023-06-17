/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  extends: "dependency-cruiser/configs/recommended-strict",
  /*
       the 'dependency-cruiser/configs/recommended-strict' preset
       contains these rules:
       no-circular            - flags all circular dependencies
       no-orphans             - flags orphan modules (except typescript .d.ts files)
       no-deprecated-core     - flags dependencies on deprecated node 'core' modules
       no-deprecated-npm      - flags dependencies on deprecated npm modules
       no-non-package-json    - flags (npm) dependencies that don't occur in package.json
       not-to-unresolvable    - flags dependencies that can't be resolved
       no-duplicate-dep-types - flags dependencies that occur more than once in package.json

       If you need to, you can override these rules. E.g. to ignore the
       no-duplicate-dep-types rule, you can set its severity to "ignore" by
       adding this to the 'forbidden' section:
       {
            "name": "no-duplicate-dep-types",
            "severity": "ignore"
       }
     */
  forbidden: [
    {
      name: "not-to-spec",
      comment:
        "Don't allow dependencies to (typescript/ javascript/ coffeescript) spec files",
      severity: "error",
      from: {},
      to: {
        path: "\\.spec\\.js$",
      },
    },
    {
      name: "not-to-dev-dep",
      severity: "error",
      comment:
        "Don't allow dependencies from src/app/lib to a development only package",
      from: {
        path: "^src",
        pathNot: "\\.spec\\.js$",
      },
      to: {
        dependencyTypes: ["npm-dev"],
      },
    },
    {
      name: "optional-deps-used",
      severity: "error",
      comment:
        "Inform when using an optional dependency. It might not be wrong - but it's not typicaly either",
      from: {},
      to: {
        dependencyTypes: ["npm-optional"],
      },
    },
    {
      name: "peer-deps-used",
      comment:
        "Warn when using a peer dependency - which might not be wrong - but it's not typicaly either",
      severity: "error",
      from: {},
      to: {
        dependencyTypes: ["npm-peer"],
      },
    },
    {
      name: "no-unreachable",
      severity: "error",
      from: {
        path: "src/cli.js",
      },
      to: {
        path: "src/",
        pathNot: ["\\.spec\\.js$"],
        reachable: false,
      },
    },
    {
      name: "no-non-test-coverage",
      severity: "error",
      from: {
        path: "src/[^\\.]+\\.spec\\.js$",
      },
      to: {
        path: "src/",
        pathNot: ["src/cli.js", "\\.spec\\.js$"],
        reachable: false,
      },
    },
  ],
  options: {
    progress: { type: "performance-log" },
    /* prefix for links in html and svg output (e.g. https://github.com/you/yourrepo/blob/develop/) */
    prefix: "https://github.com/sverweij/upem/blob/main/",
    cache: true,
    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/[^/]+",
        theme: {
          graph: {
            splines: "ortho",
          },
          modules: [
            {
              criteria: { matchesFocus: true },
              attributes: { fillcolor: "lime", penwidth: 2 },
            },
            {
              criteria: { matchesReaches: true },
              attributes: { fillcolor: "lime", penwidth: 2 },
            },
            {
              criteria: { source: ".spec.js" },
              attributes: { fillcolor: "#ccccff" },
            },
          ],
          dependencies: [
            {
              criteria: { "rules[0].severity": "error" },
              attributes: { fontcolor: "red", color: "red" },
            },
            {
              criteria: { "rules[0].severity": "warn" },
              attributes: { fontcolor: "orange", color: "orange" },
            },
            {
              criteria: { "rules[0].severity": "info" },
              attributes: { fontcolor: "blue", color: "blue" },
            },
          ],
        },
      },
    },
  },
};
// generated: dependency-cruiser@4.11.0 on 2019-01-08T19:24:33.102Z
