# reconf-solver-gui

[English](README.md)

グラフ上の組合せ遷移問題を解くための GUI ツールです。Electron デスクトップアプリとブラウザ版の両方に対応しています。

## 機能

- Cytoscape.js によるインタラクティブなグラフ編集（ノード・エッジの追加/削除、ドラッグ&ドロップ）
- 4 つの問題タイプ: **頂点独立集合**、**辺独立集合**、**頂点彩色**、**辺彩色**
- 頂点独立集合遷移問題（Token Jumping）用の IDA\* ソルバー内蔵
- 遷移列のステップごとの可視化
- DIMACS 形式（`.col` / `.dat`）によるファイル入出力
- 複数のグラフレイアウトアルゴリズム（random, grid, circle, cose, breadthfirst 等）
- データ・画像のエクスポート

## クイックスタート

### 前提条件

- Node.js (v16 以上)
- npm

### インストール

```bash
npm install
```

### Electron（デスクトップ版）

```bash
npm run build:main
npm run build:render
npm start
```

### Web（ブラウザ版）

```bash
npm run build:web
npx serve dist-web
```

ブラウザで `http://localhost:3000` を開いてください。

## 使い方

1. **グラフの読み込み**: 「Open」ボタンで `.col` ファイルを読み込むか、ウィンドウにドラッグ&ドロップします。開始/目標データは `.dat` ファイルから読み込みます。
2. **グラフの編集**: 「Edit」モードを ON にすると、キャンバスクリックでノード追加、ノード間ドラッグでエッジ追加、要素の削除ができます。
3. **ソルバーの実行**: 「Run」ボタンで最短遷移列を計算します。
4. **結果の確認**: 「Previous」/「Next」ボタンで遷移をステップごとに確認できます。

### 入力ファイル形式

グラフファイル（`.col`）:
```
p 7 7
e 1 2
e 1 3
e 2 7
...
```

開始/目標ファイル（`.dat`）:
```
s 3 6 7
t 4 5 7
```

## 技術スタック

- **フロントエンド**: React 17, TypeScript, Cytoscape.js, MUI, Emotion
- **デスクトップ**: Electron
- **Web**: Webpack 5, Web Workers
- **テスト**: Jest

## ライセンス

MIT
