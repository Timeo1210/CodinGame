const path = require("path");

module.exports = {
  entry: "./build/index.js",
  mode: "production",
  optimization: {
    minimize: false,
  },
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
};
