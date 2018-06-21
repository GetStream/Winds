module.exports = {
	env: {
		'browser': true,
		'es6': true,
		'node': true,
		'shared-node-browser': true,
		'mocha': true,
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
		'indent': ['error', 'tab'],
		'linebreak-style': ['error', 'unix'],
		'jsx-quotes': ['error', 'prefer-double'],
		'quotes': ['error', 'single'],
		'semi': ['error', 'always'],
		'comma-dangle': ['error', 'always-multiline'],
		'no-case-declarations': 'off',
		'react/jsx-sort-props': 'error',
		'eqeqeq': 'warn',
		'quote-props': ['warn', 'consistent-as-needed'],
		'react/no-deprecated': 'off',
		'no-console': 0,
		'keyword-spacing': ['error']
	},
};
