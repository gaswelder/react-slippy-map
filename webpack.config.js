module.exports = {
	entry: './app.js',
	output: {
		path: __dirname,
		filename: 'app.bin.js'
	},
	module: {
		rules: [
			{test: /\.js$/, exclude: /node_modules/, use: ['babel-loader']}
		]
	}
};
