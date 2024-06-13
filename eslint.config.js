const js = require("@eslint/js");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = [
  js.configs.recommended,

  {
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
    },
  },

  eslintConfigPrettier,
];
