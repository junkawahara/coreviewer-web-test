/** @jsxImportSource @emotion/react */

import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import edgehandles from 'cytoscape-edgehandles';
import { css } from '@emotion/react';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { useDropzone } from 'react-dropzone';

import { ButtonPalette } from './ButtonPalette';
import { ColorNumberMap } from './ColorNumberMap';
import { DisplayModeMap } from './DisplayModeMap';
import { ElementDataMap } from './ElementDataMap';
import { GraphArea } from './GraphArea';
import { GraphDataContext } from './GraphDataProvider';
import { Inputs } from './Inputs';
import { layouts } from './Layouts';
import { LayoutMap } from './LayoutMap';
import { LayoutSelectionBox } from './LayoutSelectionBox';
import { NodePosition, NodePositionMap } from './NodePosition';
import { ProblemSelectionBox } from './ProblemSelectionBox';
import { ZoomFactorMap } from './ZoomFactorMap';
import { ProblemInfoMap } from '../ProblemInfo';
import { Settings } from '../Settings';
import { getStylesheet } from '../functions/GraphFunctions';
import {
  convertElementDataToString,
  convertElementDataToStringForEdgeType,
} from '../functions/GraphDataFunctions';
import { usePlatform } from '../platform/PlatformContext';

cytoscape.use(edgehandles);
cytoscape.use(coseBilkent);

// デフォルトのズーム値です。
const defaultZoomFactor = 1.0;

// メイン ウインドウのプロパティを表す型です。
type MainWindowProp = {
  // 設定モーダルを表示するためのコールバックです（Web 版用）。
  onShowSettings?: () => void;
};

// メイン ウインドウを表す関数コンポーネントを定義します。
export const MainWindow = (_prop: MainWindowProp = {}) => {
  // プラットフォーム API を取得します。
  const platform = usePlatform();
  // ズーム値とそれを操作する関数を取得します。
  const [zoomFactor, setZoomFactor] = React.useState(1.0);
  // 編集モード フラグとそれを操作する関数を取得します。
  const [isEditMode, setIsEditMode] = React.useState(false);
  // ノード追加モード フラグとそれを操作する関数を取得します。
  const [isAddingNodeMode, setIsAddingNodeMode] = React.useState(false);
  // ノード細分モード フラグとそれを操作する関数を取得します。
  const [isSubdividingNodeMode, setIsSubdividingNodeMode] =
    React.useState(false);
  // ノード短絡モード フラグとそれを操作する関数を取得します。
  const [isBypassingNodeMode, setIsBypassingNodeMode] = React.useState(false);
  // レイアウトとそれを操作する関数を取得します。
  const [layout, setLayout] = React.useState(layouts.random);
  // 中央移動フラグとそれを操作する関数を取得します。
  const [centeringFlag, setCenteringFlag] = React.useState(false);
  // ノードの削除フラグとそれを操作する関数を取得します。
  const [nodeRemovingFlag, setNodeRemovingFlag] = React.useState(false);
  // コンテキスト データとデータ設定用関数を取得します。
  const {
    appSettings,
    setAppSettings,
    setCustomNodePositionMap,
    displayModeMap,
    setDisplayModeMap,
    setDroppedFile,
    isSolverRunning,
    elementData,
    setElementData,
    elementDataMap,
    setElementDataMap,
    layoutMap,
    setLayoutMap,
    nodePositions,
    setNodePositions,
    nodePositionMap,
    setNodePositionMap,
    problemInfo,
    problemInfoMap,
    setProblemInfoMap,
    zoomFactorMap,
    setZoomFactorMap,
    colorNumberMap,
    setColorNumberMap,
    stylesheet,
    setStylesheet,
    activeBaseGraph,
    activeStartGraph,
    activeTargetGraph,
  } = React.useContext(GraphDataContext);

  // メイン プロセスからのイベントに対するハンドラを設定します。
  useEffect(() => {
    // 問題データを受け取るハンドラを設定します。
    platform.onProblemInfoSend((event: any, problemInfoMap: any) => {
      setProblemInfoMap(problemInfoMap as ProblemInfoMap);
    });

    // アプリケーションの設定を受け取るハンドラを設定します。
    platform.onSettingsSend(
      (
        event: any,
        settings: Settings,
        solvers: string[],
        targetWindow: string,
      ) => {
        if (targetWindow === 'MainWindow') {
          setAppSettings(settings);
        }
      },
    );
  }, []);

  // アプリケーションの設定、およびスタイルシート変更時の処理です。
  useEffect(() => {
    // スタイル シートを更新します。
    const newStylesheet = getStylesheet(appSettings, stylesheet);
    setStylesheet(newStylesheet);
  }, [appSettings]);

  // ズーム値変更時の処理です。
  useEffect(() => {
    // 現在のズーム値を問題ごとのズーム値マップに設定します。
    if (zoomFactorMap[problemInfo.displayName]) {
      zoomFactorMap[problemInfo.displayName] = zoomFactor;
    }
  }, [zoomFactor]);

  // レイアウト変更時の処理です。
  useLayoutEffect(() => {
    // 現在のレイアウトを問題ごとのレイアウト情報マップに設定します。
    if (layoutMap[problemInfo.displayName]) {
      layoutMap[problemInfo.displayName] = layout;
    }
  }, [layout]);

  // レイアウト変更時にズーム値をリセットするかどうかを表すフラグです。
  const resetZoomAfterLayouting = useRef<boolean>(false);

  // 問題情報変更時の処理です。
  useLayoutEffect(() => {
    // マップに記録されているズーム値を設定します。
    if (zoomFactorMap[problemInfo.displayName]) {
      setZoomFactor(zoomFactorMap[problemInfo.displayName]);
    }
    // マップに登録されているレイアウトを設定します。
    if (layoutMap[problemInfo.displayName]) {
      setLayout(layoutMap[problemInfo.displayName]);
      resetZoomAfterLayouting.current = false;
    }
  }, [problemInfo]);

  // 問題データ保存時の処理です。
  useEffect(() => {
    // メイン プロセスからの保存用データに対応するハンドラを設定します。
    // 既に設定されているハンドラを削除します。
    platform.removeHandler('require-output-data');
    platform.onOutputDataRequired((event: any, outputType: string) => {
      let dataStrings: string[] = [];
      let curNodePositions: NodePosition[] | null = null;
      // 現在の表示モードを取得します。
      const displayMode = displayModeMap[problemInfo.displayName];
      // 表示モードが拡張形式の場合はノードの位置データを設定します。
      if (displayMode && displayMode === 'extension') {
        curNodePositions = nodePositions;
      }

      // 問題のタイプに応じて問題データを文字列に変換します。
      switch (problemInfo.problemType) {
        case 'vertex':
          dataStrings = convertElementDataToString(
            elementData,
            curNodePositions,
          );
          break;
        case 'edge':
          dataStrings = convertElementDataToStringForEdgeType(
            elementData,
            curNodePositions,
          );
          break;
      }

      let outputData = '';
      switch (outputType) {
        case 'wholedata':
          // グラフ データのみが存在する場合です。
          if (dataStrings.length >= 1) {
            outputData = dataStrings[0];
          }
          // グラフ データと開始、目標データの両方が存在する場合です。
          if (dataStrings.length >= 2) {
            outputData = outputData.concat(dataStrings[1]);
          }
          break;
        case 'graphdata':
          // グラフ データのみを保存します。
          if (dataStrings.length >= 1) {
            outputData = dataStrings[0];
          }
          break;
        case 'stdata':
          // 開始、目標データのみを保存します。
          if (dataStrings.length >= 2) {
            outputData = dataStrings[1];
          }
          break;
      }
      platform.saveData(outputData, outputType);
    });
  }, [problemInfo, displayModeMap, elementData, nodePositions]);

  // 画像保存時の処理です。
  useEffect(() => {
    // メイン プロセスからの保存用データに対応するハンドラを設定します。
    // 既に設定されているハンドラを削除します。
    platform.removeHandler('require-output-image');
    platform.onOutputImageRequired((event: any, outputType: string) => {
      const graphImages: string[] = [];

      if (outputType === 'all' || outputType === 'basegraph') {
        let baseGraphImage = activeBaseGraph?.png({
          output: 'base64',
          full: true,
        });
        baseGraphImage = baseGraphImage ? baseGraphImage : '';
        graphImages.push(baseGraphImage);
      }
      if (outputType === 'all' || outputType === 'startgraph') {
        let startGraphImage = activeStartGraph?.png({
          output: 'base64',
          full: true,
        });
        startGraphImage = startGraphImage ? startGraphImage : '';
        graphImages.push(startGraphImage);
      }
      if (outputType === 'all' || outputType === 'targetgraph') {
        let targetGraphImage = activeTargetGraph?.png({
          output: 'base64',
          full: true,
        });
        targetGraphImage = targetGraphImage ? targetGraphImage : '';
        graphImages.push(targetGraphImage);
      }
      platform.saveImage(graphImages, outputType);
    });
  }, [
    problemInfo,
    colorNumberMap,
    activeBaseGraph,
    activeStartGraph,
    activeTargetGraph,
  ]);

  // 問題ごとのデータを保存する各種マップを初期化します。
  useLayoutEffect(() => {
    const elementDataMap: ElementDataMap = {};
    const nodePositionMap: NodePositionMap = {};
    const zoomFactorMap: ZoomFactorMap = {};
    const colorNumberMap: ColorNumberMap = {};
    const layoutMap: LayoutMap = {};
    const displayModeMap: DisplayModeMap = {};
    const customNodePositionMap: NodePositionMap = {};
    Object.keys(problemInfoMap).forEach(key => {
      elementDataMap[key] = [];
      nodePositionMap[key] = [];
      zoomFactorMap[key] = defaultZoomFactor;
      colorNumberMap[key] = 0;
      layoutMap[key] = layouts.random;
      displayModeMap[key] = 'extension';
      customNodePositionMap[key] = [];
    });
    setElementDataMap(elementDataMap);
    setNodePositionMap(nodePositionMap);
    setZoomFactorMap(zoomFactorMap);
    setColorNumberMap(colorNumberMap);
    setLayoutMap(layoutMap);
    setDisplayModeMap(displayModeMap);
    setCustomNodePositionMap(customNodePositionMap);
  }, [problemInfoMap]);

  // 問題切替え時に各モードをリセットします。
  useEffect(() => {
    setIsEditMode(false);
    setIsAddingNodeMode(false);
    setNodeRemovingFlag(false);
    setCenteringFlag(false);
  }, [problemInfo]);

  // マウス ホイール動作時の処理を行う関数を作成します。
  const onWheel = useCallback(
    (event: any) => {
      event.preventDefault();
      const we = event as WheelEvent;
      let scale = zoomFactor + we.deltaY * -0.001;
      scale = Math.min(Math.max(0.125, scale), 4);
      setZoomFactor(scale);
      return false;
    },
    [zoomFactor],
  );

  // マウス ホイール動作時のハンドラを設定します。
  const baseDivRef = useRef<HTMLDivElement>(null);
  const startDivRef = useRef<HTMLDivElement>(null);
  const targetDivRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // ベース グラフ上でのマウス ホイール用のハンドラを追加します。
    baseDivRef.current?.addEventListener('mousewheel', onWheel, {
      passive: false,
    });
    // 開始集合グラフ上でのマウス ホイール用のハンドラを追加します。
    startDivRef.current?.addEventListener('mousewheel', onWheel, {
      passive: false,
    });
    // 目標集合グラフ上でのマウス ホイール用のハンドラを追加します。
    targetDivRef.current?.addEventListener('mousewheel', onWheel, {
      passive: false,
    });
    return () => {
      baseDivRef.current?.removeEventListener('mousewheel', onWheel);
      startDivRef.current?.removeEventListener('mousewheel', onWheel);
      targetDivRef.current?.removeEventListener('mousewheel', onWheel);
    };
  });

  // ズーム スライダーの値の変更時のイベント ハンドラを作成します。
  const onSliderValueChange = useCallback((e: any) => {
    setZoomFactor(e.target.value);
  }, []);

  // 編集モード変更時のイベント ハンドラを作成します。
  const handleEditMode = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsEditMode(e.target.checked);
    },
    [],
  );

  // レイアウト変更時の処理です。
  useLayoutEffect(() => {
    if (!resetZoomAfterLayouting.current) {
      // ズーム リセットフラグを有効化します。
      resetZoomAfterLayouting.current = true;
    }
  }, [layout]);

  // 問題変更時にグラフ データとノードの位置データを復元します。
  useEffect(() => {
    if (elementDataMap[problemInfo.displayName]) {
      setElementData(elementDataMap[problemInfo.displayName]);
    }
    if (nodePositionMap[problemInfo.displayName]) {
      setNodePositions(nodePositionMap[problemInfo.displayName]);
      setCenteringFlag(true);
    }
  }, [problemInfo]);

  // グラフ データ変更時の処理です。
  useEffect(() => {
    // グラフ データをマップに設定します。
    if (elementDataMap[problemInfo.displayName]) {
      elementDataMap[problemInfo.displayName] = elementData;
    }
  }, [elementData]);

  // ノード位置データ変更時の処理です。
  useEffect(() => {
    // ノードの位置データをマップに設定します。
    if (nodePositionMap[problemInfo.displayName]) {
      nodePositionMap[problemInfo.displayName] = nodePositions;
    }
  }, [nodePositions]);

  // ファイルのドラッグ アンド ドロップ時のハンドラを作成します。
  const onDrop = useCallback(
    acceptedFiles => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        platform.storeDroppedFile?.(file);
        setDroppedFile(file.path || file.name);
      }
    },
    [platform],
  );
  // ドラッグ アンド ドロップに対応するための関数を取得します。
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  // グラフのデータが読み込まれているかどうかを表すフラグを取得します。
  const elementExists: boolean = useMemo(() => {
    return elementData.length !== 0;
  }, [problemInfo, elementData]);

  // ステータスを表す文字列を取得します。
  const status = isSolverRunning ? '実行中' : '';

  // メイン ウインドウを表す要素を作成します。
  return (
    <>
      {/* メイン ウィンドウ全体に対しドラッグ アンド ドロップを有効化します。 */}
      <div {...getRootProps()} css={container(isSolverRunning)}>
        <input {...getInputProps()} />
        {/* 問題選択コンボ ボックスを表す要素です。 */}
        <div css={problemSelectionCss(isSolverRunning)}>
          <ProblemSelectionBox />
        </div>
        {/* 問題データ入力部を表す要素です。 */}
        <div css={inputsCss}>
          <Inputs
            setLayout={setLayout}
            disabled={!elementExists}
            setEditMode={setIsEditMode}
          />
        </div>
        {/* グラフ (ベース グラフ、開始集合グラフ、目標集合グラフ) 表示部を表す要素です。 */}
        <div css={graphCss(isSolverRunning)}>
          <GraphArea
            baseDivRef={baseDivRef}
            problemType={problemInfo.problemType}
            elementData={elementData}
            isEditMode={isEditMode}
            isAddingNodeMode={isAddingNodeMode}
            isSubdividingNodeMode={isSubdividingNodeMode}
            isBypassingNodeMode={isBypassingNodeMode}
            zoomFactor={zoomFactor}
            layout={layout}
            centeringFlag={centeringFlag}
            nodeRemovingFlag={nodeRemovingFlag}
            startDivRef={startDivRef}
            targetDivRef={targetDivRef}></GraphArea>
        </div>
        <div css={selectAndEditCss(isSolverRunning)}>
          <div css={selectAndEditSubCss}>
            {/* レイアウト選択コンボ ボックスを表す要素です。 */}
            <LayoutSelectionBox
              layout={layout}
              setLayout={setLayout}
              disabled={!elementExists}
            />
            {/* 編集モード切替えスイッチを表す要素です。 */}
            <FormGroup>
              <FormControlLabel
                control={<Switch onChange={handleEditMode} />}
                label="Edit"
                checked={isEditMode}
              />
            </FormGroup>
            <div style={{ height: '20px' }}></div>
            {/* ボタン パレットを表す要素です。 */}
            <ButtonPalette
              centeringFlag={centeringFlag}
              setCenteringFlag={setCenteringFlag}
              nodeRemovingFlag={nodeRemovingFlag}
              setNodeRemovingFlag={setNodeRemovingFlag}
              isEditMode={isEditMode}
              isAddingNodeMode={isAddingNodeMode}
              setIsAddingNodeMode={setIsAddingNodeMode}
              isSubdividingNodeMode={isSubdividingNodeMode}
              setIsSubdividingNodeMode={setIsSubdividingNodeMode}
              isBypassingNodeMode={isBypassingNodeMode}
              setIsBypassingNodeMode={setIsBypassingNodeMode}
              disabled={!elementExists}></ButtonPalette>
          </div>
        </div>
        <div css={sliderCss(isSolverRunning)}>
          {/* ズーム スライダーを表す要素です。 */}
          <div css={sliderSubCss}>
            <Slider
              disabled={!elementExists}
              sx={{ height: '50%' }}
              value={zoomFactor}
              orientation="vertical"
              min={1.0 / 10}
              max={2}
              step={0.1}
              onChange={onSliderValueChange}
            />
          </div>
        </div>
        {/* ステータス バーを表す要素です。 */}
        <div css={statusCss}>{status}</div>
      </div>
    </>
  );
};

// メイン ウィンドウ全体のスタイル定義です。
const container = (disabled: boolean) => css`
  display: grid;
  grid-template-columns: 3fr 8fr 8fr 1fr;
  grid-template-rows: 5fr 50fr 50fr 20px;
  width: 91vw;
  height: 91vh;
  column-gap: 0px;
  row-gap: 0px;
  // border: solid 5px #ff0000;
  pointer-events: ${disabled ? 'none' : 'auto'};
`;

// 問題選択コンボ ボックスのスタイル定義です。
const problemSelectionCss = (disabled: boolean) => css`
  width: 80%;
  grid-column-start: 2;
  grid-column-end: 4;
  grid-row-start: 1;
  grid-row-end: 2;
  justify-self: center;
  align-self: center;
  //  border: solid 5px #ff0000;
  opacity: ${disabled ? 0.5 : 1};
`;

// 入力部のスタイル定義です。
const inputsCss = css`
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 1;
  grid-row-end: 3;
  //  border: solid 5px #ff0000;
`;

// グラフ描画領域全体のスタイル定義です。
const graphCss = (disabled: boolean) => css`
  grid-column-start: 2;
  grid-column-end: 4;
  grid-row-start: 2;
  grid-row-end: 4;
  // border: solid 5px #ff0000;
  opacity: ${disabled ? 0.5 : 1};
`;

// レイアウト定義、および編集モード変更部のスタイル定義です。
const selectAndEditCss = (disabled: boolean) => css`
  grid-column-start: 4;
  grid-column-end: 5;
  grid-row-start: 1;
  grid-row-end: 4;
  // border: solid 5px #ff0000;
  justify-content: center;
  opacity: ${disabled ? 0.5 : 1};
`;

// レイアウト定義、および編集モード変更部のスタイル定義 (サブ) です。
const selectAndEditSubCss = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end;
  // border: solid 5px #ff0000;
  height: 100%;
`;

// ズーム スライダー部のスタイル定義です。
const sliderCss = (disabled: boolean) => css`
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 3;
  grid-row-end: 4;
  // border: solid 5px #ff0000;
  justify-self: center;
  opacity: ${disabled ? 0.5 : 1};
`;

// ズーム スライダー部のスタイル定義 (サブ) です。
const sliderSubCss = css`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  //  border: solid 5px #ff0000;
  height: 100%;
`;

// ステータス表示部のスタイル定義です。
const statusCss = css`
  align-items: center;
  grid-column-start: 4;
  grid-column-end: 5;
  grid-row-start: 4;
  grid-row-end: 5;
  //  border: solid 5px #ff0000;
  justify-self: end;
`;
