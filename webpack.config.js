const path = require("path");

module.exports = {
  mode: "development",
  entry: ["./examples/index.ts"],
  output: {
    filename: "./index.js",
  },
  // Turn on sourcemaps
  devtool: "source-map",
  devServer: {
    contentBase: path.join(__dirname, "examples"),
  },
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".js"],
    plugins: [],
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: "ts-loader" },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
};
