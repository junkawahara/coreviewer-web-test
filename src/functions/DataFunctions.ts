import { existsSync, readFileSync } from 'fs';
import path from 'path';
import xml2js from 'xml2js';

import { ProblemInfoMap } from '../ProblemInfo';
import { Settings, getDefaultSettings } from '../Settings';
import { SolverInfoMap } from '../SolverInfo';

/**
 * 問題リストを読み込みます。
 * @param {string} filePath 問題リスト ファイルのパス
 * @return {[ProblemInfoMap, string]} 問題情報のマップとエラー メッセージ
 */
export function readProblemInfo(filePath: string): [ProblemInfoMap, string] {
  // ファイルが存在するかどうかを確認します。
  if (!existsSync(filePath)) {
    return [
      {},
      '問題リスト ファイル (problem_list.csv) が見つかりませんでした。',
    ];
  }

  // ファイルからデータを読み込みます。
  const csv = readFileSync(filePath, {
    encoding: 'utf8',
  });

  // データを行ごとに分割します。
  const lines = csv.trim().split(/\r\n|\n/);

  const problemInfoMap: ProblemInfoMap = {};
  // 行ごとに読み込みます。
  let lineCount = 0;
  for (const line of lines) {
    lineCount++;
    // 行を空白で分割します。
    const arr = line.trim().split(/\s+/);
    // 空行は無視します。
    if (arr.length === 0 || arr[0] === '') {
      continue;
    }

    // 問題タイプが指定されていない場合はエラーを返します。
    if (arr.length < 2) {
      return [
        {},
        `問題タイプが指定されていません。\n* ファイルパス : ${filePath}\n* 行番号 : ${lineCount}`,
      ];
    }

    // 分割された各部分を各パラメータ―に割り当てます。
    const [displayName, problemType, ...res] = arr;

    // 問題タイプが不正な場合はエラーを返します。
    if (
      problemType !== 'vertex' &&
      problemType !== 'edge' &&
      problemType !== 'vcolor' &&
      problemType !== 'ecolor'
    ) {
      return [
        {},
        `問題タイプが不正です。\n* ファイルパス : ${filePath}\n* 行番号 : ${lineCount}`,
      ];
    }

    // 読み込んだ問題名が既にマップに存在している場合です。
    if (displayName in problemInfoMap) {
      return [
        {},
        `問題 ${displayName} が複数行で設定されています。\n* ファイルパス : ${filePath}`,
      ];
    }

    // 問題情報を作成しマップに設定します。
    problemInfoMap[displayName] = {
      displayName,
      problemType,
      args: res.join(' '),
    };
  }
  return [problemInfoMap, ''];
}

/**
 * ソルバー リスト ファイルを読み込みます。
 * @param {string} filePath ソルバー リスト ファイルのパス
 * @param {string} appDirPath 実行ディレクトリのパス
 * @return {[SolverInfoMap, error]} ソルバー情報のマップとエラー メッセージ
 */
export function readSolverListFile(
  filePath: string,
  appDirPath: string,
): [SolverInfoMap, string] {
  // ファイルが存在するかどうかを確認します。
  if (!existsSync(filePath)) {
    return [
      {},
      'ソルバー リスト ファイル (solver_list.csv) が見つかりませんでした。',
    ];
  }

  // ファイルからデータを読み込みます。
  const csv = readFileSync(filePath, {
    encoding: 'utf8',
  });
  // データを行ごとに分割します。
  const lines = csv.trim().split(/\r\n|\n/);

  const solverInfoMap: SolverInfoMap = {};
  // 行ごとに読み込みます。
  let lineCount = 0;
  for (const line of lines) {
    lineCount++;
    // 行を空白で分割します。
    const arr = line.trim().split(/\s+/);

    // 空行は無視します。
    if (arr.length === 0 || arr[0] === '') {
      continue;
    }

    // ソルバーのパス列が指定されていない場合はエラーを返します。
    if (arr.length < 2) {
      return [
        {},
        `ソルバーのパスが指定されていません。\n* ファイルパス : ${filePath}\n* 行番号 : ${lineCount}`,
      ];
    }

    // 分割された各部分を各パラメーターに割り当てます。
    const [name, solverPath, ...res] = arr;

    // 読み込んだ問題名が既にマップに存在している場合です。
    if (name in solverInfoMap) {
      return [
        {},
        `ソルバー ${name} が複数行で設定されています。\n* ファイルパス : ${filePath}`,
      ];
    }

    // ソルバー情報を取得しマップに登録します。
    solverInfoMap[name] = {
      name,
      // 読み込んだパスが相対パスの場合は絶対パスに変換します。
      path: path.isAbsolute(solverPath)
        ? solverPath
        : path.resolve(appDirPath, solverPath),
      args: res.join(' '),
    };
  }
  return [solverInfoMap, ''];
}

/**
 * 設定ファイルを読み込みます。
 * @param {string} filePath 設定ファイルのパス
 * @return {[Settings, (Error | null)]} 設定と、読み込みエラー情報のタプル
 */
export function readSettingFile(filePath: string): [Settings, any] {
  const settings: Settings = getDefaultSettings();

  // ファイルが存在しない場合はデフォルトの設定を返します。
  if (!existsSync(filePath)) {
    return [settings, null];
  }

  // データを読み込みます。
  const settingStr = readFileSync(filePath, {
    encoding: 'utf8',
  });

  let readingError: Error | null = null;
  try {
    // XML をパースします。
    const parser = new xml2js.Parser({ explicitArray: false });
    parser.parseString(settingStr, (error, result) => {
      if (error) {
        readingError = error;
      } else {
        // ソルバー名を取得します。
        if (result.config.solver !== undefined) {
          settings.solver = result.config.solver;
        }
        // ノードの半径を取得します。
        if (result.config.nodeRadius !== undefined) {
          settings.nodeRadius = parseInt(result.config.nodeRadius);
        }
        // ノードの枠線の幅を取得します。
        if (result.config.nodeBorderWidth !== undefined) {
          settings.nodeBorderWidth = parseInt(result.config.nodeBorderWidth);
        }
        // ノードの通常色を取得します。
        if (result.config.normalNodeColor !== undefined) {
          settings.normalNodeColor = result.config.normalNodeColor;
        }
        // 開始集合に属するノードの色を取得します。
        if (result.config.startNodeColor !== undefined) {
          settings.startNodeColor = result.config.startNodeColor;
        }
        // 目標集合に属するノードの色を取得します。
        if (result.config.targetNodeColor !== undefined) {
          settings.targetNodeColor = result.config.targetNodeColor;
        }
        // 解答中の遷移ステップに含まれるノードの色を取得します。
        if (result.config.answerNodeColor !== undefined) {
          settings.answerNodeColor = result.config.answerNodeColor;
        }
        // ノードの枠線の色を取得します。
        if (result.config.nodeBorderColor !== undefined) {
          settings.nodeBorderColor = result.config.nodeBorderColor;
        }
        // ノードのラベルを表示するかどうかを表すフラグを取得します。
        if (result.config.displayNodeLabel !== undefined) {
          settings.displayNodeLabel =
            result.config.displayNodeLabel.toLowerCase() === 'true';
        }
        // エッジの幅を取得します。
        if (result.config.edgeWidth !== undefined) {
          settings.edgeWidth = parseInt(result.config.edgeWidth);
        }
        // エッジの通常色を取得します。
        if (result.config.normalEdgeColor !== undefined) {
          settings.normalEdgeColor = result.config.normalEdgeColor;
        }
        // 開始集合に属するエッジの色を取得します。
        if (result.config.startEdgeColor !== undefined) {
          settings.startEdgeColor = result.config.startEdgeColor;
        }
        // 目標集合に属するエッジの色を取得します。
        if (result.config.targetEdgeColor !== undefined) {
          settings.targetEdgeColor = result.config.targetEdgeColor;
        }
        // 解答中の遷移ステップに含まれるエッジの色を取得します。
        if (result.config.answerEdgeColor !== undefined) {
          settings.answerEdgeColor = result.config.answerEdgeColor;
        }
        // エッジのラベルを表示するかどうかを表すフラグを取得します。
        if (result.config.displayEdgeLabel !== undefined) {
          settings.displayEdgeLabel =
            result.config.displayEdgeLabel.toLowerCase() === 'true';
        }
      }
    });
    return [settings, readingError];
  } catch (error) {
    return [getDefaultSettings(), error];
  }
}
