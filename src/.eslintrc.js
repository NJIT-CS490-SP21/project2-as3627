module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended", "airbnb"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react"],
  ignorePatterns: [
    "setupTests.js",
    "reportWebVitals.js",
    "index.js",
    "App.test.js",
  ],
  rules: {},
  overrides: [
    {
      files: ["App.js", "WinnerCheck.js", "Board.js", "Box.js", "ListUsers.js"],
      rules: {
        "react/no-array-index-key": "off",
        "react-hooks/exhaustive-deps": "off",
        "react/jsx-filename-extension": "off",
      },
    },
  ],
};
