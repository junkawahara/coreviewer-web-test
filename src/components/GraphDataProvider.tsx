import React, { createContext, useState } from 'react';
import { Core, ElementDefinition, Stylesheet } from 'cytoscape';
import { ColorNumberMap } from './ColorNumberMap';
import { DisplayModeMap } from './DisplayModeMap';
import { ElementDataMap } from './ElementDataMap';
import { GraphStartPosition } from './GraphStartPosition';
import { LayoutMap } from './LayoutMap';
import { NodePosition, NodePositionMap } from './NodePosition';
import { ProblemInfo, ProblemInfoMap } from '../ProblemInfo';
import defaultStylesheet from './stylesheet';
import { SelectionInfo } from './SelectionInfo';
import { ZoomFactorMap } from './ZoomFactorMap';
import { Settings, getDefaultSettings } from '../Settings';

/**
 * コンテキストとして管理するデータをまとめた型です。
 */
export type GraphDataState = {
  // アプリケーションの設定です。
  appSettings: Settings;
  // アプリケーション設定を設定する関数です。
  setAppSettings: React.Dispatch<React.SetStateAction<Settings>>;

  // 問題ごとのカスタム レイアウトにおけるノードの位置を記録したマップです。
  customNodePositionMap: NodePositionMap;
  // カスタム レイアウトにおけるノードの位置のマップを設定する関数です。
  setCustomNodePositionMap: React.Dispatch<
    React.SetStateAction<NodePositionMap>
  >;

  // データの表示モードです。
  displayModeMap: DisplayModeMap;
  // データの表示モードを設定する関数です。
  setDisplayModeMap: React.Dispatch<React.SetStateAction<DisplayModeMap>>;

  // ドラッグ アンド ドロップされたファイルのパスです。
  droppedFile: string;
  // ドラッグ アンド ドロップされたファイルのパスを設定します。
  setDroppedFile: React.Dispatch<React.SetStateAction<string>>;

  // ソルバーが実行中かどうかを表すフラグです。
  isSolverRunning: boolean;
  // ソルバーが実行中かどうかを表すフラグの設定用関数です。
  setSolverRunning: React.Dispatch<React.SetStateAction<boolean>>;

  // 問題のグラフ データです。
  elementData: ElementDefinition[];
  // グラフ データを設定する関数です。
  setElementData: React.Dispatch<React.SetStateAction<ElementDefinition[]>>;

  // 問題ごとのグラフ データのマップです、
  elementDataMap: ElementDataMap;
  // 問題ごとのグラフ データのマップを設定する関数です。
  setElementDataMap: React.Dispatch<React.SetStateAction<ElementDataMap>>;

  // グラフの開始位置データです。
  graphStartPosition: GraphStartPosition;
  // グラフの開始位置を設定する関数です。
  setGraphStartPosition: React.Dispatch<
    React.SetStateAction<GraphStartPosition>
  >;

  // レイアウトです。
  layoutMap: LayoutMap;
  // レイアウトを設定する関数です。
  setLayoutMap: React.Dispatch<React.SetStateAction<LayoutMap>>;

  // ノードの位置データです。
  nodePositions: NodePosition[];
  // ノードの位置データを設定する関数です。
  setNodePositions: React.Dispatch<React.SetStateAction<NodePosition[]>>;

  // 問題ごとのノードの位置データのマップです。
  nodePositionMap: NodePositionMap;
  // 問題ごとのノードの位置データのマップを設定する
  setNodePositionMap: React.Dispatch<React.SetStateAction<NodePositionMap>>;

  // 選択されている問題の情報です。
  problemInfo: ProblemInfo;
  // 選択されている問題を切り替える関数です。
  setProblemInfo: React.Dispatch<React.SetStateAction<ProblemInfo>>;

  // 問題ごとの問題情報のマップです。
  problemInfoMap: ProblemInfoMap;
  // 問題ごとの問題情報のマップを設定する関数です。
  setProblemInfoMap: React.Dispatch<React.SetStateAction<ProblemInfoMap>>;

  // ノードの選択情報です。
  selectionInfoList: SelectionInfo[];
  // ノードの選択情報を設定する関数です。
  setSelectionInfoList: React.Dispatch<React.SetStateAction<SelectionInfo[]>>;

  // ズーム値のマップです。
  zoomFactorMap: ZoomFactorMap;
  // ズーム値のマップを設定する関数です。
  setZoomFactorMap: React.Dispatch<React.SetStateAction<ZoomFactorMap>>;

  // 色数のマップです。
  colorNumberMap: ColorNumberMap;
  // 色数のマップを設定する関数です。
  setColorNumberMap: React.Dispatch<React.SetStateAction<ColorNumberMap>>;

  // グラフのスタイル シートです。
  stylesheet: Stylesheet[];
  // スタイル シートを設定する関数です。
  setStylesheet: React.Dispatch<React.SetStateAction<Stylesheet[]>>;

  // アクティブなベース グラフです。
  activeBaseGraph: Core | null;
  setActiveBaseGraph: React.Dispatch<React.SetStateAction<Core | null>>;

  // アクティブな開始集合グラフです。
  activeStartGraph: Core | null;
  setActiveStartGraph: React.Dispatch<React.SetStateAction<Core | null>>;

  // アクティブな目標集合グラフです。
  activeTargetGraph: Core | null;
  setActiveTargetGraph: React.Dispatch<React.SetStateAction<Core | null>>;
};

// データを管理するコンテキストを取得します。
export const GraphDataContext = createContext<GraphDataState>(
  {} as GraphDataState,
);

// コンテキスト データにアクセスするためのプロバイダを取得します。
export const GraphDataProvider = (props: any) => {
  // アプリケーションの設定を保持する状態変数を取得します。
  const [appSettings, setAppSettings] = useState<Settings>(
    getDefaultSettings(),
  );
  // 問題ごとのカスタム レイアウトにおけるノードの位置のマップを保持する状態変数を取得します。
  const [customNodePositionMap, setCustomNodePositionMap] =
    useState<NodePositionMap>({});
  // データの表示モードを保持する状態変数を取得します。
  const [displayModeMap, setDisplayModeMap] = useState<DisplayModeMap>({});
  // ドラッグ アンド ドロップされたファイルのパスを保持する状態変数を取得します
  const [droppedFile, setDroppedFile] = useState<string>('');
  // グラフ データを保持する状態変数を取得します。
  const [elementData, setElementData] = useState<ElementDefinition[]>([]);
  // 問題ごとのグラフ データのマップを保持する状態変数を取得します。
  const [elementDataMap, setElementDataMap] = useState<ElementDataMap>({});
  // グラフの開始位置情報を保持する状態変数を取得します。
  const [graphStartPosition, setGraphStartPosition] =
    useState<GraphStartPosition>({ position: '' });
  // ソルバーが実行中かどうかを表すフラグを保持する状態変数を取得します。
  const [isSolverRunning, setSolverRunning] = useState<boolean>(false);
  // レイアウトを保持する状態変数を取得します。
  const [layoutMap, setLayoutMap] = useState<LayoutMap>({});
  // ノードの位置情報を保持する状態変数を取得します。
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);
  // ノードの位置情報のマップを保持する状態変数を取得します。
  const [nodePositionMap, setNodePositionMap] = useState<NodePositionMap>({});
  // 問題情報を保持する状態変数を取得します。
  const [problemInfo, setProblemInfo] = useState<ProblemInfo>({
    displayName: '',
    problemType: '',
    args: '',
  });
  // 問題情報のマップを保持する状態変数を取得します、
  const [problemInfoMap, setProblemInfoMap] = useState<ProblemInfoMap>({});
  // ノードの選択情報を保持する状態変数を取得します。
  const [selectionInfoList, setSelectionInfoList] = useState<SelectionInfo[]>(
    [],
  );
  // ズーム値のマップを保持する状態変数を取得します。
  const [zoomFactorMap, setZoomFactorMap] = useState<ZoomFactorMap>({});
  // 色数のマップを保持する状態変数を取得します。
  const [colorNumberMap, setColorNumberMap] = useState<ColorNumberMap>({});
  // スタイル シートを保持する状態変数を取得します。
  const [stylesheet, setStylesheet] = useState<Stylesheet[]>(defaultStylesheet);
  // アクティブなベース グラフを保持する状態変数を取得します。
  const [activeBaseGraph, setActiveBaseGraph] = useState<Core | null>(null);
  // アクティブな開始集合グラフを保持する状態変数を取得します。
  const [activeStartGraph, setActiveStartGraph] = useState<Core | null>(null);
  // アクティブな目標集合グラフを保持する状態変数を取得します。
  const [activeTargetGraph, setActiveTargetGraph] = useState<Core | null>(null);

  const { children } = props;

  // プロバイダーを表す要素を作成します。
  return (
    <GraphDataContext.Provider
      value={{
        appSettings,
        setAppSettings,
        isSolverRunning,
        setSolverRunning,
        displayModeMap,
        setDisplayModeMap,
        droppedFile,
        setDroppedFile,
        customNodePositionMap,
        setCustomNodePositionMap,
        elementData,
        setElementData,
        elementDataMap,
        setElementDataMap,
        graphStartPosition,
        setGraphStartPosition,
        layoutMap,
        setLayoutMap,
        nodePositions,
        setNodePositions,
        nodePositionMap,
        setNodePositionMap,
        problemInfo,
        setProblemInfo,
        problemInfoMap,
        setProblemInfoMap,
        selectionInfoList,
        setSelectionInfoList,
        zoomFactorMap,
        setZoomFactorMap,
        colorNumberMap,
        setColorNumberMap,
        stylesheet,
        setStylesheet,
        activeBaseGraph,
        setActiveBaseGraph,
        activeStartGraph,
        setActiveStartGraph,
        activeTargetGraph,
        setActiveTargetGraph,
      }}>
      {children}
    </GraphDataContext.Provider>
  );
};
