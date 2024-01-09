module.exports = {
  root: true,
  env: { es6: true, node: true },
  extends: ['airbnb', 'airbnb/hooks', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    project: true,
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    camelcase: 'off',
    'class-methods-use-this': 'off',
    'func-names': 'off',
    // Node import syntax requires `.js` extension by default: https://nodejs.org/dist/latest-v20.x/docs/api/esm.html#esm_resolution_algorithm
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/*.?(test|spec).?(c|m)js?(x)', '**/*.config.?(c|m)js'],
      },
    ],
    'no-console': 'off',
    'no-process-exit': 'off',
    'no-unused-vars': 'warn',
    'max-classes-per-file': 'off',
    'object-shorthand': 'off',
    'prettier/prettier': 'error',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      env: { browser: true, es6: true, node: true },
      extends: ['airbnb', 'airbnb/hooks', 'airbnb-typescript', 'prettier'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: true,
        ecmaFeatures: {
          jsx: true,
        },
      },
      plugins: ['@typescript-eslint', 'prettier'],
      rules: {
        'class-methods-use-this': 'off',
        'func-names': 'off',
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: ['**/*.?(test|spec).?(c|m)ts?(x)', '**/*.config.?(c|m)ts'],
          },
        ],
        'max-classes-per-file': 'off',
        'no-console': 'off',
        'no-process-exit': 'off',
        'no-unused-vars': 'warn',
        'object-shorthand': 'off',
        'prettier/prettier': 'error',
        'react/jsx-uses-react': 'off',
        'react/react-in-jsx-scope': 'off',
      },
    },
  ],
};
