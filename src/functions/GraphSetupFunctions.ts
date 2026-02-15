import { Core, ElementDefinition, NodeSingular } from 'cytoscape';
import { EdgeHandlesInstance } from 'cytoscape-edgehandles';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';

import {
  addEdgeData,
  getEdgeRemoved,
  getNewEdges,
  moveToCenter,
  updateNodeAndEdgeId,
} from './GraphFunctions';
import {
  addNode,
  subdivideNode,
  bypassNode,
} from './GraphManipulationFunctions';
import { getEdgeData, cloneElement } from './UtilFunctions';
import { NodePosition } from '../components/NodePosition';
import { SelectionInfo } from '../components/SelectionInfo';

// 引数が無く戻り値が無い関数を表す型です。
type Func = () => void;
// 引数が 1 つで戻り値が無い関数を表す型です。
type EventFunc = (event: any) => void;

/**
 * マウスのドラッグ完了時の処理を行うハンドラを取得します。
 * @param {MutableRefObject<Core|null> } cyRef グラフのインスタンスの参照
 * @param {React.Dispatch<React.SetStateAction<NodePosition[]>>} setNodePositions ノードの位置データを設定する関数
 * @return {Func} ドラッグ完了時の処理を行うハンドラ
 */
function getDragFreeHandler(
  cyRef: MutableRefObject<Core | null>,
  setNodePositions: React.Dispatch<React.SetStateAction<NodePosition[]>>,
): Func {
  return () => {
    setNodePositions(() => {
      const newPositions: NodePosition[] = [];
      cyRef.current?.nodes().forEach(node => {
        newPositions.push({
          id: node.data('id'),
          x: node.position('x'),
          y: node.position('y'),
          isStart: node.data('isstart'),
          isTarget: node.data('istarget'),
          isSelected: node.selected(),
        });
      });
      return newPositions;
    });
  };
}

/**
 * ノードのタップ時の処理を行うハンドラを取得します。
 * @param {MutableRefObject<Core|null> } cyRef グラフのインスタンスの参照
 * @param {MutableRefObject<boolean>} isEditModeRef 編集モード フラグの参照
 * @param {MutableRefObject<boolean>} isBypassingNodeModeRef ノード短絡モード フラグの参照
 * @param {Dispatch<SetStateAction<ElementDefinition[]>>} setElementData グラフ データ設定用関数
 * @param {Dispatch<SetStateAction<NodePosition[]>>} setNodePositions ノードの位置設定用関数
 * @return {EventFunc} ノードのタップ時の処理を行うハンドラ
 */
function getNodeTapHandler(
  cyRef: MutableRefObject<Core | null>,
  isEditModeRef: MutableRefObject<boolean>,
  isBypassingNodeModeRef: MutableRefObject<boolean>,
  setElementData: Dispatch<SetStateAction<ElementDefinition[]>>,
  setNodePositions: Dispatch<SetStateAction<NodePosition[]>>,
): EventFunc {
  return event => {
    if (!isEditModeRef.current) {
      return;
    }
    if (isBypassingNodeModeRef.current) {
      // 短絡モードの場合はノードの短絡を行います。
      bypassNode(event, cyRef, setElementData, setNodePositions);
    }
  };
}

/**
 * エッジのタップ時の処理を行うハンドラを取得します。
 * @param {MutableRefObject<Core|null> } cyRef グラフのインスタンスの参照
 * @param {MutableRefObject<boolean>} isEditModeRef 編集モード フラグの参照
 * @param {MutableRefObject<boolean>} isSubdividingNodeModeRef ノード細分モード フラグの参照
 * @param {Dispatch<SetStateAction<ElementDefinition[]>>} setElementData グラフ データ設定用関数
 * @param {Dispatch<SetStateAction<NodePosition[]>>} setNodePositions ノードの位置設定用関数
 * @return {EventFunc} エッジのタップ時の処理を行うハンドラ
 */
function getEdgeTapHandler(
  cyRef: MutableRefObject<Core | null>,
  isEditModeRef: MutableRefObject<boolean>,
  isSubdividingNodeModeRef: MutableRefObject<boolean>,
  setElementData: Dispatch<SetStateAction<ElementDefinition[]>>,
  setNodePositions: Dispatch<SetStateAction<NodePosition[]>>,
): EventFunc {
  return event => {
    if (!isEditModeRef.current) {
      return;
    }
    if (isSubdividingNodeModeRef.current) {
      subdivideNode(event, cyRef, setElementData, setNodePositions);
    } else {
      // ノード細分モード以外の場合はクリックされたエッジを削除します。
      setElementData(elems => {
        const newElems = [...elems];
        return getEdgeRemoved(
          event.target.data('source'),
          event.target.data('target'),
          newElems,
        );
      });
    }
  };
}

/**
 * エッジ連結時の処理を行うハンドラを取得します。
 * @param {MutableRefObject<Core|null> } cyRef グラフのインスタンスの参照
 * @param {MutableRefObject<ElementDefinition[]>} elementsRef グラフの要素データの参照
 * @param {Dispatch<SetStateAction<ElementDefinition[]>>} setElementData グラフの要素データ設定用関数
 * @return {Func} エッジ連結時の処理を行うハンドラ
 */
function getEhCompleteHandler(
  cyRef: MutableRefObject<Core | null>,
  elementsRef: MutableRefObject<ElementDefinition[]>,
  setElementData: Dispatch<SetStateAction<ElementDefinition[]>>,
): Func {
  return () => {
    if (cyRef.current != null && elementsRef.current.length !== 0) {
      const newEdges = getNewEdges(cyRef.current.edges(), elementsRef.current);
      if (newEdges.length === 1) {
        const addingEdge = newEdges[0];
        setElementData(elems =>
          addEdgeData(
            addingEdge.data('source'),
            addingEdge.data('target'),
            elems,
          ),
        );
      }
    }
  };
}

/**
 * クリック時の処理を行うハンドラを取得します。
 * @param {MutableRefObject<Core|null> } cyRef グラフのインスタンスの参照
 * @param {MutableRefObject<boolean>} isAddingNodeModeRef ノード追加モードフラグの参照
 * @param {Dispatch<SetStateAction<ElementDefinition[]>>} setElementData グラフの要素データ設定用関数
 * @param {Dispatch<SetStateAction<NodePosition[]>>} setNodePositions ノードの位置設定用関数
 * @return {EventFunc} クリック時の処理を行うハンドラ
 */
function getClickHandler(
  cyRef: MutableRefObject<Core | null>,
  isAddingNodeModeRef: MutableRefObject<boolean>,
  setElementData: Dispatch<SetStateAction<ElementDefinition[]>>,
  setNodePositions: Dispatch<SetStateAction<NodePosition[]>>,
): EventFunc {
  return event => {
    if (isAddingNodeModeRef.current && event.target === cyRef.current) {
      addNode(
        event.position.x,
        event.position.y,
        cyRef,
        setElementData,
        setNodePositions,
      );
    }
  };
}

/**
 * ノードの選択状態が変更された場合の処理を行うハンドラを取得します。
 * @param {MutableRefObject<Core|null> } cyRef グラフのインスタンスの参照
 * @param {Dispatch<SetStateAction<SelectionInfo[]>>} setSelectionInfoList ノードの選択状態設定用関数
 * @return {Func} ノードの選択状態が変更された場合の処理を行うハンドラ
 */
function getNodeSelectionChangeHandler(
  cyRef: MutableRefObject<Core | null>,
  setSelectionInfoList: Dispatch<SetStateAction<SelectionInfo[]>>,
): Func {
  return () => {
    const selectionInfoList: SelectionInfo[] = [];
    cyRef.current?.nodes().forEach(node => {
      // 各ノードの選択情報を取得します。
      selectionInfoList.push({
        id: node.data('id'),
        selected: node.selected(),
      });
    });
    // 取得した選択状態を設定します。
    setSelectionInfoList(selectionInfoList);
  };
}

/**
 * ダブル クリック時の処理を行うハンドラを取得します
 * @param {MutableRefObject<Core|null> } cyRef グラフのインスタンスの参照
 * @param {MutableRefObject<boolean>} isEditModeRef 編集モードフラグの参照
 * @param {Dispatch<SetStateAction<ElementDefinition[]>>} setElementData グラフの要素データ設定用関数
 * @param {Dispatch<SetStateAction<NodePosition[]>>} setNodePositions ノードの位置設定用関数
 * @return {EventFunc} ダブル クリック時の処理を行うハンドラ
 */
function getDoubleClickHandler(
  cyRef: MutableRefObject<Core | null>,
  isEditModeRef: MutableRefObject<boolean>,
  setElementData: Dispatch<SetStateAction<ElementDefinition[]>>,
  setNodePositions: Dispatch<SetStateAction<NodePosition[]>>,
): EventFunc {
  return event => {
    let targetId = '';
    if (isEditModeRef.current) {
      targetId = event.target.data('id');
      // 削除後に設定する各ノードの位置リストです。
      const newNodePositions: NodePosition[] = [];
      // グラフ データを更新します。
      setElementData(elems => {
        const newEles = [...elems].filter(elem => {
          // クリックされた以外のノード データを残します。
          if (elem.data.type === 'node') {
            return elem.data.id !== targetId;
          } else if (elem.data.type === 'edge') {
            // クリックされたノードを始点と終点としてもたないエッジ データを残します。
            return (
              elem.data.source !== targetId && elem.data.target !== targetId
            );
          }
          return false;
        });
        const newNodeIdMap: { [key: string]: string } = {};
        // ノードとエッジの ID を更新します。
        const updatedElementData = updateNodeAndEdgeId(newEles, newNodeIdMap);

        // 新しいノードの位置データを取得します。
        cyRef.current?.nodes().forEach(node => {
          if (newNodeIdMap[node.data('id')]) {
            const newId = newNodeIdMap[node.data('id')];
            newNodePositions.push({
              id: newId,
              x: node.position('x'),
              y: node.position('y'),
              isStart: node.data('isstart'),
              isTarget: node.data('istarget'),
              isSelected: false,
            });
          }
        });
        return updatedElementData;
      });
      setNodePositions(newNodePositions);

      // 削除したノードと同じ ID を持つ新しいノードが削除操作後に選択状態となる場合がありります。
      // これを避けるために対象ノードを明示的に非選択状態にします。
      const targetNode = cyRef.current?.getElementById(targetId);
      if (targetNode) {
        targetNode.unselect();
      }
    }
  };
}

/**
 * グラフのインスタンスの設定を行います。
 * @param {Core} cy グラフのインスタンス
 * @param {MutableRefObject<Core|null> } cyRef グラフのインスタンスの参照
 * @param {MutableRefObject<EdgeHandlesInstance | null>} ehRef エッジ操作用のハンドラの参照
 */
function setupEdgeHandleInstance(
  cy: Core,
  cyRef: MutableRefObject<Core | null>,
  ehRef: MutableRefObject<EdgeHandlesInstance | null>,
): void {
  // エッジ操作用インスタンスのデフォルト パラメータ―を作成します。
  const defaultEdgeHandleParam = {
    canConnect: function (sourceNode: NodeSingular, targetNode: NodeSingular) {
      return (
        sourceNode.data('id') != targetNode.data('id') &&
        !(sourceNode.data('isstart') && targetNode.data('isstart')) &&
        !(sourceNode.data('istarget') && targetNode.data('istarget'))
      );
    },
    edgeParams: function (sourceNode: NodeSingular, targetNode: NodeSingular) {
      // 現在存在するエッジの ID の中で最大の値を求めます。
      // edges() には余分な edge が含まれる可能性があるためセレクタで辺を取得します。
      // TODO : 上記原因の調査
      const edges = cyRef.current?.$('[type = "edge"]');
      let newId = -1;
      if (edges?.length === 0) {
        newId = 1;
      } else {
        const maxId = edges?.max(element => {
          return parseInt(element.data('edgeId'));
        });
        newId = maxId === undefined ? Infinity : maxId?.value + 1;
      }
      return getEdgeData(sourceNode.data('id'), targetNode.data('id'), newId);
    },
    hoverDelay: 150,
    snap: true,
    snapThreshold: 50,
    snapFrequency: 15,
    noEdgeEventsInDraw: true,
    disableBrowserGestures: true,
  };
  ehRef.current = cy.edgehandles(defaultEdgeHandleParam);
  ehRef.current.disableDrawMode();
}

/**
 * グラフのインスタンスの設定を行います。
 * @param {Core} cy グラフのインスタンス
 * @param {MutableRefObject<Core|null> } cyRef グラフのインスタンスの参照
 * @param {MutableRefObject<EdgeHandlesInstance | null>} ehRef エッジ操作用のハンドラの参照
 * @param {MutableRefObject<ElementDefinition[]>} elementsRef グラフの要素データの参照
 * @param {MutableRefObject<boolean>} isEditModeRef 編集モードフラグの参照
 * @param {MutableRefObject<boolean>} isAddingNodeModeRef ノード追加モード フラグの参照
 * @param {MutableRefObject<boolean>} isSubdividingNodeModeRef ノード細分モード フラグの参照
 * @param {MutableRefObject<boolean>} isBypassingNodeModeRef ノード短絡モード フラグの参照
 * @param {Dispatch<SetStateAction<ElementDefinition[]>>} setElementData グラフの要素データ設定用関数
 * @param {Dispatch<SetStateAction<NodePosition[]>>} setNodePositions ノードの位置設定用関数
 * @param {Dispatch<SetStateAction<SelectionInfo[]>>} setSelectionInfoList ノードの選択状態設定用関数
 * @param {boolean} enableNodeRemovingByDoubleClick ダブル クリックによるノードの除去を有効化するかどうかのフラグです。
 */
export function setup(
  cy: Core,
  cyRef: MutableRefObject<Core | null>,
  ehRef: MutableRefObject<EdgeHandlesInstance | null>,
  elementsRef: MutableRefObject<ElementDefinition[]>,
  isEditModeRef: MutableRefObject<boolean>,
  isAddingNodeModeRef: MutableRefObject<boolean>,
  isSubdividingNodeModeRef: MutableRefObject<boolean>,
  isBypassingNodeModeRef: MutableRefObject<boolean>,
  setElementData: Dispatch<SetStateAction<ElementDefinition[]>>,
  setNodePositions: Dispatch<SetStateAction<NodePosition[]>>,
  setSelectionInfoList: Dispatch<SetStateAction<SelectionInfo[]>>,
  enableNodeRemovingByDoubleClick = false,
): void {
  if (!cyRef.current) {
    cyRef.current = cy;
    // ノードのドラッグ完了後時のイベント ハンドラを設定します。
    cyRef.current.on(
      'dragfree',
      'node',
      getDragFreeHandler(cyRef, setNodePositions),
    );

    // ウインドウ リサイズ時のイベント ハンドラを設定します。
    window.addEventListener('resize', () => {
      moveToCenter(cy);
    });

    // ノード タップ時のイベント ハンドラを設定します。
    cyRef.current.on(
      'tap',
      'node',
      getNodeTapHandler(
        cyRef,
        isEditModeRef,
        isBypassingNodeModeRef,
        setElementData,
        setNodePositions,
      ),
    );

    // エッジ タップ時のイベント ハンドラを設定します。
    cyRef.current.on(
      'tap',
      'edge',
      getEdgeTapHandler(
        cyRef,
        isEditModeRef,
        isSubdividingNodeModeRef,
        setElementData,
        setNodePositions,
      ),
    );

    // エッジ接続時のイベント ハンドラを設定します。
    cyRef.current.on(
      'ehcomplete ',
      getEhCompleteHandler(cyRef, elementsRef, setElementData),
    );

    // クリック時のハンドラを設定します。
    cyRef.current.on(
      'click',
      getClickHandler(
        cyRef,
        isAddingNodeModeRef,
        setElementData,
        setNodePositions,
      ),
    );

    // ノードの選択状態が変更された場合のハンドラを設定します。
    cyRef.current.on(
      'select unselect boxselect',
      'node',
      getNodeSelectionChangeHandler(cyRef, setSelectionInfoList),
    );

    if (enableNodeRemovingByDoubleClick) {
      // ダブル クリックによるノードの除去処理を設定します。
      cyRef.current.on(
        'dblclick',
        'node',
        getDoubleClickHandler(
          cyRef,
          isEditModeRef,
          setElementData,
          setNodePositions,
        ),
      );
    }
  }

  // エッジ操作用インスタンスの設定を行います。
  if (!ehRef.current) {
    setupEdgeHandleInstance(cy, cyRef, ehRef);
  }
}
