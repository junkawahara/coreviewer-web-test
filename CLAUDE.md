# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

グラフの組合せ遷移問題を解くためのElectron + Reactデスクトップアプリケーション（reconf-solver-gui v1.4.0）。Cytoscape.jsによるインタラクティブなグラフ可視化と、外部ソルバープロセスとの連携を行う。

## Build & Development Commands

```bash
npm run build:main    # TypeScript main processのコンパイル (src/ → dist/)
npm run build:render  # Webpack Reactバンドル (dist/bundle.js + HTML生成)
npm start             # Electronアプリ起動 (両方のビルドが必要)
npm test              # Jest テスト実行
```

テストファイルは `src/functions/*.test.ts` に配置。対象: GraphFunctions, GraphDataFunctions, DataFunctions, UtilFunctions。

## Architecture

### Electronプロセス構成
- **Main process** (`src/main.ts`): ファイルI/O、ソルバー実行（`child_process.exec`）、ウィンドウ管理、IPCハンドリング
- **Renderer process** (`src/index.tsx`): React UI、Cytoscapeグラフ描画
- **Preload** (`src/preload.ts`): Context Bridge経由でIPC APIをrendererに公開

### 状態管理
Redux等は不使用。`GraphDataProvider.tsx`でReact Context APIによる一元管理を行う。グラフデータ、ノード位置、設定、表示モード、レイアウト、ズーム、カラー情報をContextで配信。

### 問題タイプと対応コンポーネント
4つの問題モード: `vertex`, `edge`, `vcolor`, `ecolor`
- `*Type*Graph`コンポーネント: vertex/edgeモード用
- `*ColorType*Graph`コンポーネント: vcolor/ecolorモード用

### グラフ可視化
Cytoscape.jsベースで以下のプラグインを使用:
- `cytoscape-cose-bilkent`: 力指向レイアウト
- `cytoscape-edgehandles`: インタラクティブなエッジ作成

### ウィンドウ構成（`WindowFunctions.ts`で管理）
- Main window: グラフ編集
- Settings window: 設定
- Result window: ソルバー結果表示

### ソルバー連携
グラフをDIMACSフォーマットに変換してソルバーに渡し、stdoutから遷移系列を解析。プラットフォーム別バイナリは`solver/`配下。問題定義は`problem_list.csv`、ソルバー定義は`solver_list.csv`。

### 主要な関数モジュール（`src/functions/`）
- `GraphFunctions.ts`: グラフ操作（ノード追加/削除、ズーム、スタイルシート生成）
- `GraphDataFunctions.ts`: DIMACS形式へのシリアライズ/デシリアライズ、ソルバー出力解析
- `DataFunctions.ts`: CSV/XML設定ファイル読み込み
- `WindowFunctions.ts`: Electronウィンドウ生成・メニュー構成
- `GraphManipulationFunctions.ts`: インタラクティブなグラフ編集操作

### データ型（`src/`直下）
- `Settings.ts`: アプリケーション設定
- `ProblemInfo.ts`: 問題定義
- `SolverInfo.ts`: ソルバー情報

## Code Conventions

- ESLint: Googleスタイルガイドベース + TypeScript + React + Prettier統合
- Prettier: 80文字幅、2スペースインデント、trailing comma、LF改行
- インターフェース命名: 先頭に`I`を付ける（例: `ISettings`）
- コードコメントは日本語
- TypeScript strict mode有効、ターゲットES2020、モジュールCommonJS

## Git Workflow

- **Commit frequently**: Make small, incremental commits after completing each feature or fix
- Do not batch multiple unrelated changes into a single commit
- **Auto-commit after implementation**: When an implementation task is completed and tests pass, automatically commit the changes without waiting for user instruction
