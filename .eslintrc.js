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
		indent: ['error', 4],
		'linebreak-style': ['error', 'unix'],
		quotes: ['error', 'double'],
		semi: ['error', 'never'],
		'comma-dangle': ['error', 'always-multiline'],
		'sort-keys': 'error',
		'no-case-declarations': 'off',
		// 'sort-imports': 'error',
		'react/jsx-sort-props': 'error',
		eqeqeq: 'warn',
		'quote-props': ['warn', 'consistent-as-needed'],
		'react/no-deprecated': 'off',
	},
};
