const path = require("path");
//node_modules\react-scripts\config\webpack.config.js

module.exports = function override(config, env) {
	const wasmExtensionRegExp = /\.wasm$/;

	let ext = config.resolve.extensions;
	config.resolve.extensions = ext.concat([".ts", ".tsx", ".wasm", ".css"]);

	config.module.rules.forEach(rule => {
		(rule.use || []).forEach(use => {
			if (use.options && use.options.useEslintrc !== undefined) {
				use.options.useEslintrc = true;
			}
		});
		(rule.oneOf || []).forEach(oneOf => {
			if (oneOf.options && oneOf.options.babelrc !== undefined) {
				oneOf.options.babelrc = true;
			}
			if (oneOf.loader && oneOf.loader.indexOf("file-loader") >= 0) {
				// Make file-loader ignore WASM files
				oneOf.exclude.push(wasmExtensionRegExp);
			}
		});
	});

	// Add a dedicated loader for WASM
	config.module.rules.push({
		test: wasmExtensionRegExp,
		include: path.resolve(__dirname, "src"),
		use: [{ loader: require.resolve("wasm-loader"), options: {} }]
	});

	config.optimization.splitChunks.minSize = 500000;
	config.optimization.splitChunks.maxSize = 1000000;

	return config;
};
