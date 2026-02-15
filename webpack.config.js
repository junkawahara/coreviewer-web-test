const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // Electronのレンダラプロセスで動作することを指定します。
  target: 'electron-renderer',
  // 起点となるファイルです。
  entry: './src/index.tsx',
  // webpack watch したときに差分ビルドができます。
  cache: true,
  // development は、source map file を作成します。再ビルド時間の短縮などのための設定です。
  // production は、コードの圧縮やモジュールの最適化が行われる設定です。
  mode: 'development', // "production" | "development" | "none"
  // ソースマップのタイプです。
  devtool: 'source-map',
  // 出力先設定 __dirname は node でのカレントディレクトリのパスが格納される変数です。
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  // ファイルタイプ毎の処理を記述します。
  module: {
    rules: [
      {
        // コンパイルの事前に eslint によるチェックを行います。
        // 拡張子 .ts または .tsx の場合に適用します。
        test: /\.tsx?$/,
        // 事前処理であることを示します。
        enforce: 'pre',
        // TypeScript をコード チェックします。
        loader: 'eslint-loader',
      },
      {
        // 正規表現で指定します。
        // 拡張子 .ts または .tsx の場合に適用します。
        test: /\.tsx?$/,
        // ローダーの指定です。
        // TypeScript をコンパイルします。
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader','css-loader'],
      },
    ],
  },
  // 処理対象のファイルを記載します。
  resolve: {
    extensions: [
      '.ts',
      '.tsx',
      '.js', // node_modulesのライブラリ読み込みに必要となります。
    ],
  },
  plugins: [
    // Webpack plugin を利用します。
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './html/index.html',
    }),
    new HtmlWebpackPlugin({
      filename: 'result_window.html',
      template: './html/result_window.html',
    }),
    new HtmlWebpackPlugin({
      filename: 'setting_window.html',
      template: './html/setting_window.html',
    }),
  ],
};
