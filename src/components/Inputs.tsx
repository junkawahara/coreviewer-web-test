/** @jsxImportSource @emotion/react */

import React, {
  Dispatch,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  SetStateAction,
} from 'react';
import { css } from '@emotion/react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { GraphDataContext } from './GraphDataProvider';
import { NodePosition } from './NodePosition';
import { readInputFile } from '../functions/InputAreaFunctions';
import {
  convertElementDataToString,
  convertElementDataToStringForEdgeType,
  convertNodePositionDataToString,
} from '../functions/GraphDataFunctions';
import { usePlatform } from '../platform/PlatformContext';

// 入力用コンポーネントのプロパティを表す型です。
type InputsProp = {
  // レイアウト設定用関数です。
  setLayout: Dispatch<any>;
  // コンポーネントが無効化されているかどうかを表すフラグです。
  disabled: boolean;
  // 編集モードの有効/無効を設定する関数です。
  setEditMode: Dispatch<SetStateAction<any>>;
};

// 入力用コンポーネントです。
export const Inputs = (prop: InputsProp) => {
  const { setLayout, disabled, setEditMode } = prop;
  // プラットフォーム API を取得します。
  const platform = usePlatform();
  // コンテキスト データとデータ設定用関数を取得します。
  const {
    appSettings,
    customNodePositionMap,
    droppedFile,
    setDroppedFile,
    isSolverRunning,
    setSolverRunning,
    displayModeMap,
    elementData,
    setElementData,
    nodePositions,
    setNodePositions,
    problemInfo,
    colorNumberMap,
    setColorNumberMap,
    stylesheet,
  } = useContext(GraphDataContext);

  // グラフの要素データ配列を文字列に変換します。
  const [graphData, stData] = useMemo(() => {
    let curNodePositions: NodePosition[] | null = null;
    const displayMode = displayModeMap[problemInfo.displayName];
    // 表示形式が拡張形式の場合はノードの位置データを設定します。
    if (displayMode && displayMode === 'extension') {
      curNodePositions = nodePositions;
    }

    switch (problemInfo.problemType) {
      // 問題が頂点タイプの場合です。
      case 'vertex':
        return convertElementDataToString(elementData, curNodePositions);
      // 問題が辺タイプの場合です。
      case 'edge':
        return convertElementDataToStringForEdgeType(
          elementData,
          curNodePositions,
        );
      // 問題が頂点彩色タイプの場合です。
      case 'vcolor':
        return convertElementDataToString(
          elementData,
          curNodePositions,
          elementData.length > 0 ? colorNumberMap[problemInfo.displayName] : -1,
        );
      case 'ecolor':
        return convertElementDataToStringForEdgeType(
          elementData,
          curNodePositions,
          elementData.length > 0 ? colorNumberMap[problemInfo.displayName] : -1,
        );
    }
    return ['', ''];
  }, [problemInfo, elementData, nodePositions, colorNumberMap]);

  // [Open] クリック時のイベント ハンドラを作成します。
  // このイベント ハンドラ内では、ファイル ダイアログを用いて入力ファイルを読み込みます。
  const handleGraphOpen = useCallback(() => {
    platform.openFileDialog().then(([path, data]) => {
      if (!data) return;
      readInputFile(
        platform,
        path,
        data,
        elementData,
        problemInfo,
        customNodePositionMap,
        displayModeMap,
        setColorNumberMap,
        setElementData,
        setNodePositions,
        setLayout,
        setEditMode,
      );
    });
  }, [problemInfo, elementData]);

  // ソルバー実行完了時の処理です。
  useEffect(() => {
    platform.onSolverFinished(() => {
      setSolverRunning(false);
    });
  }, []);

  // [Run] クリック時のハンドラを作成します。
  const handleSolve = useCallback(() => {
    const isColorType =
      problemInfo.problemType === 'vcolor' ||
      problemInfo.problemType === 'ecolor';
    const numColors = isColorType
      ? colorNumberMap[problemInfo.displayName]
      : -1;
    setSolverRunning(true);
    // ソルバーを実行するためのイベントを発生させます。
    platform.runSolver(
      graphData,
      stData,
      convertNodePositionDataToString(nodePositions),
      problemInfo.displayName,
      stylesheet,
      numColors,
    );
  }, [
    problemInfo,
    graphData,
    stData,
    nodePositions,
    stylesheet,
    colorNumberMap,
  ]);

  // [Cancel] クリック時のハンドラを作成します。
  const handleCancelSolving = () => {
    // ソルバーの実行をキャンセルするためのイベントを発生させます。
    platform.cancelSolver();
  };

  const divRef = useRef<HTMLDivElement | null>(null);
  const [rowSize, setRowSize] = useState(1);
  // ウインドウのサイズ変更時にテキスト エリアの行数を変更する処理です。
  useLayoutEffect(() => {
    const updateRowSize = () => {
      if (divRef.current) {
        setRowSize(divRef.current.offsetHeight * 0.025);
      }
    };
    // 行サイズを更新します。
    window.addEventListener('resize', updateRowSize);
    updateRowSize();
    return () => window.removeEventListener('resize', updateRowSize);
  }, []);

  // ソルバー実行用ボタン、およびキャンセル用のボタンの要素を作成します。
  const solveCancelButton = isSolverRunning ? (
    // ソルバー キャンセル ボタンです。
    <Button
      variant="outlined"
      size="small"
      onClick={handleCancelSolving}
      css={cancelButtonCss}>
      Cancel
    </Button>
  ) : (
    // ソルバー 実行ボタンです。
    <Button
      disabled={disabled}
      variant="outlined"
      size="small"
      onClick={handleSolve}>
      Run
    </Button>
  );

  // ファイルがドラッグ アンド ドロップされた場合の処理です。
  useLayoutEffect(() => {
    if (droppedFile !== '') {
      // ファイルを読み込みます。
      platform.readFile(droppedFile).then(data => {
        readInputFile(
          platform,
          droppedFile,
          data,
          elementData,
          problemInfo,
          customNodePositionMap,
          displayModeMap,
          setColorNumberMap,
          setElementData,
          setNodePositions,
          setLayout,
          setEditMode,
        );

        setDroppedFile('');
      });
    }
  }, [droppedFile]);

  // 入力エリアを表す要素を作成します。
  return (
    <div css={container} ref={divRef}>
      {/* データ表示部です。 */}
      <div css={textFieldCss(isSolverRunning)}>
        <TextField
          multiline
          rows={rowSize}
          value={graphData.concat(stData)}
          sx={{ width: '100%', height: 'auto', overflowX: 'auto' }}
        />
      </div>
      <div css={buttons}>
        {/* Open ボタンです。 */}
        <Button
          variant="outlined"
          size="small"
          onClick={handleGraphOpen}
          css={openButtonCss(isSolverRunning)}>
          Open
        </Button>
        {/* ソルバーの実行/キャンセルを行うボタンです。 */}
        {solveCancelButton}
      </div>
      <div css={solverLabelCss}>ソルバー : </div>
      <div css={solverNameCss}>{appSettings.solver}</div>
    </div>
  );
};

// 全体のスタイル定義です。
const container = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 100%;
`;

// テキスト表示部のスタイル定義です。
const textFieldCss = (disabled: boolean) => css`
  width: 100%;
  opacity: ${disabled ? 0.5 : 1};
`;

// ボタン配置部のスタイル定義です。
const buttons = css`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

// Open ボタンのスタイル定義です。
const openButtonCss = (disabled: boolean) => css`
  opacity: ${disabled ? 0.5 : 1};
`;

// Cancel ボタンのスタイル定義です。
const cancelButtonCss = css`
  pointer-events: auto;
`;

// ソルバー ラベルのスタイル定義です。
const solverLabelCss = css`
  width: 100%;
  text-align: start;
`;

// ソルバー名表示部のスタイル定義です。
const solverNameCss = css`
  width: 100%;
  text-align: start;
`;
