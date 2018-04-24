module.exports = {
	extends: 'stylelint-config-standard',
	plugins: ['stylelint-order'],
	rules: {
		'declaration-colon-newline-after': null,
		indentation: 'tab',
		'order/properties-alphabetical-order': true,
	},
};
