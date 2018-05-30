module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
        'shared-node-browser': true,
    },
    extends: ['eslint:recommended', 'plugin:react/recommended'],
    parser: 'babel-eslint',
    parserOptions: {
        ecmaFeatures: {
            experimentalObjectRestSpread: true,
            jsx: true,
        },
        sourceType: 'module',
    },
    plugins: ['react'],
    rules: {
        indent: ['error', 'tabs'],
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
        'comma-dangle': ['error', 'always-multiline'],
        'sort-keys': 'error',
        'no-case-declarations': 'off',
        'react/jsx-sort-props': 'error',
        eqeqeq: 'warn',
        'quote-props': ['warn', 'consistent-as-needed'],
        'react/no-deprecated': 'off',
    },
};
