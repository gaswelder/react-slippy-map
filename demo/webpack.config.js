module.exports = {
	entry: './app.js',
	output: {
		path: __dirname,
		filename: 'demo.bin.js'
	},
	module: {
		rules: [
			{test: /\.js$/, exclude: /node_modules/, use: ['babel-loader']}
		]
	}
};
