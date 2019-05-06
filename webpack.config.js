module.exports = {
  entry: "./src/index.js",
  output: {
    path: __dirname,
    filename: "index.js",
    libraryTarget: "umd"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: { presets: ["@babel/env", "@babel/react"] }
        }
      }
    ]
  },
  externals: ["react", "react-dom"]
};
