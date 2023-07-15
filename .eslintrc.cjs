/* eslint-disable no-magic-numbers */
module.exports = {
  extends: ["moving-meadow", "plugin:@typescript-eslint/recommended"],
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    complexity: ["warn", 5],
    "security/detect-non-literal-fs-filename": "off",
    "security/detect-object-injection": "off",
    "node/no-unsupported-features/es-syntax": "off",
    "sort-imports": "off",
    "import/no-relative-parent-imports": "off",
    "unicorn/prefer-at": "off",
    // node/no-missing-import and import/no-unresolved can't handle
    // .js extensions pointing to seemingly typescript files. No
    // man overboard as we check this with dependency-cruiser anyway
    "node/no-missing-import": "off",
    "import/no-unresolved": "off",
  },
  overrides: [
    {
      files: ["src/**/*.test.ts"],
      rules: {
        "node/global-require": "off",
        "max-lines-per-function": "off",
      },
    },
  ],
};
