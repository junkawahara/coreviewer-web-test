import cytoscape, { Core, ElementDefinition } from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import coseBilkent from 'cytoscape-cose-bilkent';
import { EdgeHandlesInstance } from 'cytoscape-edgehandles';
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import { GraphDataContext } from './GraphDataProvider';
import { GraphProps } from './GraphProps';
import {
  forceRendering,
  getEdgeTypeTargetStateHandler,
  moveToCenter,
  zoom,
} from '../functions/GraphFunctions';
import { setup } from '../functions/GraphSetupFunctions';

cytoscape.use(coseBilkent);

// 辺タイプ用の目標集合グラフを表す関数コンポーネントを定義します。
export const EdgeTypeTargetGraph = (props: GraphProps) => {
  // 引数から各プロパティを取得します。
  const {
    isAddingNodeMode,
    isSubdividingNodeMode,
    isBypassingNodeMode,
    isEditMode,
    zoomFactor,
    centeringFlag,
    visible,
  } = props;

  // コンテキスト データとデータ設定用の関数を取得します。
  const {
    elementData,
    setElementData,
    graphStartPosition,
    nodePositions,
    setNodePositions,
    selectionInfoList,
    setSelectionInfoList,
    stylesheet,
    setActiveTargetGraph,
  } = useContext(GraphDataContext);

  // グラフのインスタンスの参照を取得します。
  const cyRef = useRef<Core | null>(null);

  // エッジを操作するためのハンドラの参照を取得します。
  const ehRef = useRef<EdgeHandlesInstance | null>(null);

  // 編集モード フラグの参照を取得します。
  const isEditModeRef = useRef<boolean>(false);

  // ノード追加モード フラグの参照を取得します。
  const isAddingNodeModeRef = useRef<boolean>(false);

  // ノード細分モード フラグの参照を取得します。
  const isSubdividingNodeModeRef = useRef<boolean>(false);

  // ノード短絡モード フラグの参照を取得します。
  const isBypassingNodeModeRef = useRef<boolean>(false);

  // グラフのデータの参照を取得します。
  const elementsRef = useRef<ElementDefinition[]>([]);

  // グラフのデータ更新時の処理です。
  // 再レンダリングのための処理を行います。
  useEffect(() => {
    elementsRef.current = elementData;
    if (cyRef.current) {
      forceRendering(cyRef.current);
      // 辺ラベルが確実に更新されるようにするための処理です。
      // TODO : この処理が本当に必要かどうか検討。
      cyRef.current?.edges().flashClass('updating', 0.00001);
    }
  }, [elementData]);

  // 編集モード変更時の処理です。
  useEffect(() => {
    isEditModeRef.current = isEditMode;
    if (ehRef.current) {
      if (isEditMode) {
        // 編集モードが有効の場合はエッジの操作を有効にします。
        ehRef.current.enableDrawMode();
      } else {
        // 編集モードが無効の場合はエッジの操作を無効にします。
        ehRef.current.disableDrawMode();
      }
    }
  }, [isEditMode]);

  // ノード追加モード フラグを参照に設定します。
  isAddingNodeModeRef.current = isAddingNodeMode;
  // ノード細分モードの有効/無効を表すフラグの参照を設定します。
  isSubdividingNodeModeRef.current = isSubdividingNodeMode;
  // ノード短絡モードの有効/無効を表すフラグの参照を設定します。
  isBypassingNodeModeRef.current = isBypassingNodeMode;

  // グラフの開始位置変更時の処理です。
  // 開始位置の種類に合わせてグラフを移動させます。
  useLayoutEffect(() => {
    if (cyRef.current) {
      switch (graphStartPosition.position) {
        case 'center_and_fit':
          moveToCenter(cyRef.current, true);
          break;
        case 'center':
          moveToCenter(cyRef.current, false);
          break;
      }
    }
  }, [graphStartPosition]);

  // 目標位置フラグにあわせてエッジのスタイルを変更する関数です。
  const setTargetStateStyle = (cy: Core) => {
    // 目標位置フラグに合わせて辺をアノテーションします。
    cy.edges()
      .filter(node => node.data('istarget'))
      .addClass('target-state');
    cy.edges()
      .filter(node => !node.data('istarget'))
      .removeClass('target-state');
  };

  // グラフをズームします。
  useLayoutEffect(() => {
    zoom(cyRef.current, zoomFactor);
  }, [zoomFactor]);

  // グラフを中央へ移動するかどうかを表すフラグが有効の場合はグラフを中央へ移動します。
  useEffect(() => {
    if (centeringFlag && cyRef.current) {
      moveToCenter(cyRef.current, false);
    }
  }, [centeringFlag]);

  // グラフの初期設定を行う関数を作成します。
  const init = useCallback((cy: Core) => {
    setTargetStateStyle(cy);
    if (!cyRef.current) {
      // エッジ クリック時のハンドラを設定します。
      cy.on('tap', 'edge', getEdgeTypeTargetStateHandler(setElementData));
    }
    // グラフ インスタンスの初期設定を行います。
    setup(
      cy,
      cyRef,
      ehRef,
      elementsRef,
      isEditModeRef,
      isAddingNodeModeRef,
      isSubdividingNodeModeRef,
      isBypassingNodeModeRef,
      setElementData,
      setNodePositions,
      setSelectionInfoList,
    );
  }, []);

  // ノードの位置データ変更時の処理です。
  // 位置の変更をグラフ インスタンスに反映させます。
  useEffect(() => {
    if (cyRef.current) {
      nodePositions.forEach(nodePosition => {
        const node = cyRef.current?.nodes().getElementById(nodePosition.id);
        if (node) {
          // グラフ中のノードの位置を、現在のデータに従い変更します。
          if (nodePosition.x !== undefined && nodePosition.y !== undefined) {
            node.position({ x: nodePosition.x, y: nodePosition.y });
          }
        }
      });
    }
  }, [nodePositions]);

  // ノードの選択状態を更新する処理です。
  useEffect(() => {
    selectionInfoList.forEach(selectionInfo => {
      const node = cyRef.current?.nodes().getElementById(selectionInfo.id);
      if (node) {
        if (selectionInfo.selected) {
          node.select();
        } else {
          node.unselect();
        }
      }
    });
  }, [selectionInfoList]);

  // グラフがアクティブになった場合の処理です。
  useEffect(() => {
    if (cyRef && cyRef.current && visible) {
      setActiveTargetGraph(cyRef.current);
    }
  }, [visible]);

  // 目標集合グラフを表す要素を作成します。
  return (
    <CytoscapeComponent
      elements={elementData}
      style={{
        width: '100%',
        height: '100%',
      }}
      cy={cy => init(cy)}
      userZoomingEnabled={false}
      stylesheet={stylesheet}
      maxZoom={4}
      minZoom={0.125}
      boxSelectionEnabled={true}
    />
  );
};
