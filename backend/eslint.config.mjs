module.exports = {
  env: {
    browser: true, // Browser global variables
    es2021: true, // Enable ES2021 globals
    node: true,
    type: module, // Node.js global variables
  },
  extends: [
    'eslint:recommended', // Use recommended rules
    'plugin:react/recommended', // Use recommended rules for React
    'plugin:@typescript-eslint/recommended', // Use recommended rules for TypeScript
  ],
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended"],
  parser: '@typescript-eslint/parser', // Specify the ESLint parser for TypeScript
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // Enable JSX
    },
    ecmaVersion: 12, // Use the latest ECMAScript features
    sourceType: 'module', // Allow the use of imports
  },
  plugins: [
    'react', // React plugin
    '@typescript-eslint', // TypeScript plugin
  ],
  rules: {
    // Custom rules can be added here
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    '@typescript-eslint/no-explicit-any': 'warn', // Warn on 'any' type
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Allow implicit return types
    'no-unused-vars': 'warn', // Warn on unused variables
    'react/prop-types': 'off', // Disable prop-types as we use TypeScript
  },
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
  {
    "parser": "@typescript-eslint/parser",
    "plugins": ["@typescript-eslint"],
    "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended"
    ]
  }
  
};
