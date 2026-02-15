const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // ブラウザで動作することを指定します。
  target: 'web',
  // 起点となるファイルです。
  entry: './src/index-web.tsx',
  // webpack watch したときに差分ビルドができます。
  cache: true,
  // development は、source map file を作成します。再ビルド時間の短縮などのための設定です。
  // production は、コードの圧縮やモジュールの最適化が行われる設定です。
  mode: 'development', // "production" | "development" | "none"
  // ソースマップのタイプです。
  devtool: 'source-map',
  // 出力先設定です。
  output: {
    path: path.join(__dirname, 'dist-web'),
    filename: 'bundle.js',
  },
  // ファイルタイプ毎の処理を記述します。
  module: {
    rules: [
      {
        // 拡張子 .ts または .tsx の場合に適用します。
        test: /\.tsx?$/,
        // TypeScript をコンパイルします。
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.web.json',
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  // 処理対象のファイルを記載します。
  resolve: {
    extensions: [
      '.ts',
      '.tsx',
      '.js',
    ],
    fallback: {
      fs: false,
      path: false,
      child_process: false,
      worker_threads: false,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './html/web.html',
    }),
  ],
};
