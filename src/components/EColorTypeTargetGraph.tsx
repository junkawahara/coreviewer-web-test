import cytoscape, { Core, ElementDefinition, Stylesheet } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { EdgeHandlesInstance } from 'cytoscape-edgehandles';
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  MutableRefObject,
} from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

import { GraphDataContext } from './GraphDataProvider';
import { GraphProps } from './GraphProps';
import {
  forceRendering,
  getStyleSeetForEColorType,
  moveToCenter,
  updateColorIndexClass,
  setClickHandlerForColorType,
  zoom,
} from '../functions/GraphFunctions';
import { setup } from '../functions/GraphSetupFunctions';

cytoscape.use(coseBilkent);

// 辺彩色タイプ用の目標集合グラフを表す関数コンポーネントを定義します。
export const EColorTypeTargetGraph = (props: GraphProps) => {
  // 引数から各プロパティを取得します。
  const {
    isEditMode,
    zoomFactor,
    isAddingNodeMode,
    isSubdividingNodeMode,
    isBypassingNodeMode,
    centeringFlag,
    numColors,
    visible,
  } = props;

  // コンテキスト データとそれらを操作する関数を取得します。
  const {
    elementData,
    setElementData,
    graphStartPosition,
    nodePositions,
    setNodePositions,
    problemInfo,
    selectionInfoList,
    setSelectionInfoList,
    stylesheet,
    setActiveTargetGraph,
  } = useContext(GraphDataContext);

  // グラフの参照を取得します。
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

  // 問題タイプの参照を取得します。
  const problemTypeRef = useRef<string>('');

  // 辺彩色問題用のスタイル シートを保持する変数を取得します。
  const [eColorStylesheet, setEColorStylesheet] = useState<Stylesheet[]>([]);

  // 目標位置フラグにあわせてノードのスタイルを変更する関数を作成します。
  const setTargetStateStyle = useCallback(setInitialClass, []);

  // エッジj クリック時のハンドラを保持する変数を取得します。
  const [edgeClickHandlers, setEdgeClickHandlers] = useState<any[]>([]);

  // 問題タイプ変更時の処理です。
  useLayoutEffect(() => {
    problemTypeRef.current = problemInfo.problemType;
  }, [problemInfo]);

  // グラフのデータ更新時の処理です。
  useEffect(() => {
    elementsRef.current = elementData;
    if (cyRef.current) {
      forceRendering(cyRef.current);
    }
    if (cyRef.current) {
      // 各エッジの色インデックスを表すクラスを更新します。
      updateColorIndexClass(cyRef, elementData, false, false);
    }
  }, [elementData]);

  // 編集モード変更時の処理です。
  useEffect(() => {
    isEditModeRef.current = isEditMode;
    if (ehRef.current) {
      if (isEditMode) {
        ehRef.current.enableDrawMode();
      } else {
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

  // ズーム値変更時の処理です。
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
    if (!cyRef.current) {
      // ノード クリック時のハンドラを設定します。
      setClickHandlerForColorType(
        cy,
        setElementData,
        setEdgeClickHandlers,
        numColors,
        false,
        false,
        isSubdividingNodeModeRef,
      );
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
    setTargetStateStyle(cyRef, problemTypeRef);
  }, []);

  // スタイル、または色数が変更された場合の処理です。
  useLayoutEffect(() => {
    setEColorStylesheet(getStyleSeetForEColorType(stylesheet, numColors));
  }, [stylesheet, numColors]);

  // 色数が変更された場合の処理です。
  useLayoutEffect(() => {
    if (cyRef.current) {
      // エッジ クリック時のハンドラを設定し直します。
      if (edgeClickHandlers.length > 1) {
        cyRef.current.removeListener('tap', edgeClickHandlers[0]);
        cyRef.current.removeListener('cxttap', edgeClickHandlers[1]);
      }
      setClickHandlerForColorType(
        cyRef.current,
        setElementData,
        setEdgeClickHandlers,
        numColors,
        false,
        false,
        isSubdividingNodeModeRef,
      );
    }
  }, [numColors]);

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

  // ノードの選択状態変更時の処理です。
  // 選択の変更をグラフ インスタンスに反映させます。
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
    if (cyRef && cyRef.current) {
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
      stylesheet={eColorStylesheet}
      maxZoom={4}
      minZoom={0.125}
      boxSelectionEnabled={true}
    />
  );
};

/**
 * 初期クラスの設定を行います。
 * @param {MutableRefObject<Core | null> | null} cyRef グラフのインスタンスの参照
 * @param {MutableRefObject<string>} problemTypeRef 問題の種類の参照
 */
function setInitialClass(
  cyRef: MutableRefObject<Core | null> | null,
  problemTypeRef: MutableRefObject<string>,
) {
  // グラフのインスタンスが存在しない場合は何もせず終了します。
  if (!cyRef?.current) {
    return;
  }
  const cy = cyRef.current;
  if (cy) {
    // 各エッジに対し、目標色インデックスに応じたクラスを設定します。
    if (problemTypeRef.current === 'ecolor') {
      cy.edges().forEach(edge => {
        const targetColorIndex = edge.data('targetcolorindex');
        if (targetColorIndex != null && targetColorIndex >= 1) {
          edge.addClass(`color-index-${targetColorIndex}`);
        } else {
          edge.addClass(`color-index-null`);
        }
      });
    }
  }
}
