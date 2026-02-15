import cytoscape, { Core, ElementDefinition } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { EdgeHandlesInstance } from 'cytoscape-edgehandles';
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

import { GraphDataContext } from './GraphDataProvider';
import { GraphProps } from './GraphProps';
import { layouts } from './Layouts';
import { NodePosition } from './NodePosition';
import {
  moveToCenter,
  removeSelectedNodes,
  zoom,
} from '../functions/GraphFunctions';
import { setup } from '../functions/GraphSetupFunctions';

cytoscape.use(coseBilkent);

// 頂点彩色タイプ問題用のベース グラフを表す関数コンポーネントを定義します。
export const EColorTypeBaseGraph = (props: GraphProps) => {
  // 引数から各プロパティを取得します。
  const {
    centeringFlag,
    isAddingNodeMode,
    isSubdividingNodeMode,
    isBypassingNodeMode,
    isEditMode,
    layout,
    nodeRemovingFlag,
    visible,
    zoomFactor,
  } = props;

  // コンテキスト データとそれらを操作する関数を取得します。
  const {
    elementData,
    setElementData,
    setGraphStartPosition,
    nodePositions,
    setNodePositions,
    selectionInfoList,
    setSelectionInfoList,
    stylesheet,
    setActiveBaseGraph,
  } = useContext(GraphDataContext);

  // グラフの参照を取得します。
  const cyRef = useRef<Core | null>(null);

  // エッジを操作するハンドラの参照を取得します。
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

  // レイアウトを保持する状態を取得します。
  const [curLayout, setCurLayout] = useState<any>(layouts.null);

  // レイアウトを更新する処理です。
  useLayoutEffect(() => {
    if (visible) {
      setCurLayout(layout);
    }
  }, [layout]);

  // グラフのデータの参照を更新する処理です。
  useLayoutEffect(() => {
    elementsRef.current = elementData;
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

  // ノード追加モードの有効/無効を表すフラグの参照を設定します。
  isAddingNodeModeRef.current = isAddingNodeMode;
  // ノード細分モードの有効/無効を表すフラグの参照を設定します。
  isSubdividingNodeModeRef.current = isSubdividingNodeMode;
  // ノード短絡モードの有効/無効を表すフラグの参照を設定します。
  isBypassingNodeModeRef.current = isBypassingNodeMode;

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

  // グラフの位置や大きさを調整するための関数を作成します。
  const adjustGraph = useCallback((cy: Core) => {
    // グラフを中央に移動します。
    cy.center();
    moveToCenter(cy, false);
    // ノードの位置データを再設定します。
    setNodePositions(() => {
      const newPositions: NodePosition[] = [];
      cyRef.current?.nodes().forEach(node => {
        newPositions.push({
          id: node.data('id'),
          x: node.position('x'),
          y: node.position('y'),
          isStart: node.data('isstart'),
          isTarget: node.data('istarget'),
          isSelected: false,
        });
      });
      return newPositions;
    });
    setGraphStartPosition({ position: 'center' });
  }, []);

  // グラフを中央へ移動するかどうかを表すフラグが有効の場合はグラフを中央へ移動します。
  useEffect(() => {
    if (centeringFlag && cyRef.current) {
      moveToCenter(cyRef.current, false);
    }
  }, [centeringFlag]);

  // グラフの初期設定を行う関数を作成します。
  const init = useCallback((cy: Core) => {
    if (!cyRef.current) {
      // レイアウト変更完了時のハンドラを設定します。
      cy.on('layoutstop', event => {
        const layoutOptions = event.layout.options;
        // レイアウト完了時にグラフの位置を調整します。
        // (カスタム レイアウトで中心へ移動フラグが設定されていない場合は除く)
        if (
          !(
            layoutOptions.name === 'preset' &&
            layoutOptions.center !== undefined &&
            !layoutOptions.center
          )
        ) {
          adjustGraph(cy);
        }
      });
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
        true,
      );
    }
  }, []);

  // ズーム値の変更に合わせてグラフを拡大、縮小する処理です。
  useLayoutEffect(() => {
    zoom(cyRef.current, zoomFactor);
  }, [zoomFactor]);

  // ノード除去フラグ有効時に選択されたノードを除去する処理です。
  useEffect(() => {
    if (nodeRemovingFlag) {
      let newNodePosition: NodePosition[] = [];
      setElementData(eles => {
        const newData = removeSelectedNodes(cyRef, eles);
        newNodePosition = newData[1];
        return newData[0];
      });
      setNodePositions(newNodePosition);
    }
  }, [nodeRemovingFlag]);

  // グラフがアクティブになった場合の処理です。
  useEffect(() => {
    if (cyRef && cyRef.current && visible) {
      setActiveBaseGraph(cyRef.current);
    }
  }, [visible]);

  // ベース グラフを表す要素を作成します。
  return (
    <CytoscapeComponent
      elements={elementData}
      style={{
        width: '100%',
        height: '100%',
      }}
      cy={cy => init(cy)}
      userZoomingEnabled={false}
      layout={curLayout}
      stylesheet={stylesheet}
      maxZoom={4}
      minZoom={0.125}
      boxSelectionEnabled={true}
    />
  );
};
