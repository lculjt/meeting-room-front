const { merge } = require("webpack-merge");

const baseConfig = require("./webpack.base.js");
const ESLintPlugin = require("eslint-webpack-plugin");
module.exports = merge(baseConfig, {
  mode: "development",
  target: "web",
  plugins: [new ESLintPlugin({ extensions: ["js", "ts", "vue"] })],
  devServer: {
    proxy: [{
        "/": {
          // 需要代理到的真实目标服务器，如/api/user会被代理到https://www.juejin.cn/api/user
          target: "https://127.0.0.1:3000",
          // 是否更改代理后请求的headers中host地址，某些安全级别较高的服务器会对此做校验
          changeOrigin: true,
          // 默认情况下不接受将请求转发到https的api服务器上，如果希望支持，可以设置为false
          secure: false,
        },
    }],
    hot: true,
    open: true,
  },
});
