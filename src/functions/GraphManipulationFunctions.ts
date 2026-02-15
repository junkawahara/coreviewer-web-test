import { Core, ElementDefinition, NodeSingular } from 'cytoscape';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';

import { updateNodeAndEdgeId } from './GraphFunctions';
import { cloneElement } from './UtilFunctions';
import { NodePosition } from '../components/NodePosition';

/**
 * クリック位置にノードを追加します。
 * @param {number} x クリック位置の x 座標値
 * @param {number} y クリック位置の y 座標値
 * @param {MutableRefObject<Core|null> } cyRef グラフのインスタンスの参照
 * @param {Dispatch<SetStateAction<ElementDefinition[]>>} setElementData グラフの要素データ設定用関数
 * @param {Dispatch<SetStateAction<NodePosition[]>>} setNodePositions ノードの位置設定用関数
 * @return {number} 追加されたノードの ID
 */
export function addNode(
  x: number,
  y: number,
  cyRef: MutableRefObject<Core | null>,
  setElementData: Dispatch<SetStateAction<ElementDefinition[]>>,
  setNodePositions: Dispatch<SetStateAction<NodePosition[]>>,
): number {
  // 現在存在するノードの ID の中で最大の値を求めます。
  const maxId = cyRef.current?.nodes().max(element => {
    return parseInt(element.data('id'));
  });
  let newId = -1;
  setElementData(elems => {
    const newElems = [...elems];
    // 追加するノードの ID を取得します。
    newId = maxId === undefined ? -1 : maxId?.value + 1;
    if (elems.length === 0) {
      newId = 1;
    }

    // 新規ノード データを追加します。
    newElems.push({
      data: {
        id: `${newId}`,
        label: `Node${newId}`,
        type: 'node',
        isstart: false,
        istarget: false,
      },
      // マウスがクリックされた場所の座標を設定します。
      position: {
        x,
        y,
      },
    });
    return newElems;
  });

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
        isSelected: node.selected(),
      });
    });
    return newPositions;
  });

  return newId;
}

/**
 * ノードの細分を行います。
 * @param {any } event イベント
 * @param {MutableRefObject<Core|null> } cyRef グラフのインスタンスの参照
 * @param {Dispatch<SetStateAction<ElementDefinition[]>>} setElementData グラフ データ設定用関数
 * @param {Dispatch<SetStateAction<NodePosition[]>>} setNodePositions ノードの位置設定用関数
 */
export function subdivideNode(
  event: any,
  cyRef: MutableRefObject<Core | null>,
  setElementData: Dispatch<SetStateAction<ElementDefinition[]>>,
  setNodePositions: Dispatch<SetStateAction<NodePosition[]>>,
) {
  // 現在存在するノードの ID の中で最大の値を求めます。
  const maxId = cyRef.current?.nodes().max(element => {
    return parseInt(element.data('id'));
  });
  let newId = -1;
  setElementData(elements => {
    const newElements: ElementDefinition[] = [];
    // 追加するノードの ID を取得します。
    newId = maxId === undefined ? -1 : maxId?.value + 1;
    if (elements.length === 0) {
      newId = 1;
    }
    const targetEdgeId = parseInt(event.target.data('edgeId'));
    // 新しいグラフ データを作成します。
    elements.forEach(elem => {
      const newElem = cloneElement(elem);
      if (newElem.data.type === 'edge') {
        const edgeId = parseInt(newElem.data.edgeId);
        if (edgeId === targetEdgeId) {
          // 現在のデータがクリックされたエッジのデータの場合です。
          // エッジのターゲットが新しく追加したノードとなるように修正をします。
          const source = parseInt(newElem.data.source);
          const target = parseInt(newElem.data.target);
          const newSource = source < target ? source : target;
          const newTarget = source >= target ? source : target;
          newElem.data.source = newSource.toString();
          newElem.data.target = newId.toString();
          newElem.data.id = `${newSource}-${newId}`;

          // 細分されて新たにできたエッジのデータを作成します。
          const newEdge = cloneElement(newElem);
          newEdge.data.isstart = false;
          newEdge.data.istarget = false;
          newEdge.data.edgeId = `${targetEdgeId + 1}`;
          newEdge.data.label = `Edge${newEdge.data.edgeId}`;
          newEdge.data.id = `${newId}-${newTarget}`;
          newEdge.data.source = newId;
          newEdge.data.target = newTarget;
          newEdge.data.startcolorindex = -1;
          newEdge.data.targetcolorindex = -1;
          newElements.push(newEdge);
        } else if (edgeId > targetEdgeId) {
          // クリックされたエッジより ID が大きなエッジについては、ID を +1 します。
          newElem.data.edgeId = `${edgeId + 1}`;
          newElem.data.label = `Edge${newElem.data.edgeId}`;
        }
      }
      newElements.push(newElem);
    });

    // 新規ノード データを追加します。
    newElements.push({
      data: {
        id: `${newId}`,
        label: `Node${newId}`,
        type: 'node',
        isstart: false,
        istarget: false,
        startcolorindex: -1,
        targetcolorindex: -1,
      },
      // マウスがクリックされた場所の座標を設定します。
      position: {
        x: event.position.x,
        y: event.position.y,
      },
    });

    return newElements;
  });

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
        isSelected: node.selected(),
      });
    });
    return newPositions;
  });
}

/**
 * ノードの短絡を行います。
 * @param {any} event イベント
 * @param {MutableRefObject<Core|null> } cyRef グラフのインスタンスの参照
 * @param {Dispatch<SetStateAction<ElementDefinition[]>>} setElementData グラフ データ設定用関数
 * @param {Dispatch<SetStateAction<NodePosition[]>>} setNodePositions ノードの位置設定用関数
 */
export function bypassNode(
  event: any,
  cyRef: MutableRefObject<Core | null>,
  setElementData: Dispatch<SetStateAction<ElementDefinition[]>>,
  setNodePositions: Dispatch<SetStateAction<NodePosition[]>>,
) {
  if (event.target.degree() !== 2) {
    // 対象となるノードの次数が 2 でない場合は何もしません。
    return;
  }
  if (!cyRef || !cyRef.current) {
    return;
  }
  const targetNodeId = event.target.data('id');
  const targetNode = cyRef.current?.getElementById(targetNodeId);

  const connectingEdges = targetNode.connectedEdges();
  let bypassed = false;
  if (connectingEdges.length === 2) {
    const endPoints: NodeSingular[] = [];
    connectingEdges.forEach(edge => {
      const endPoint =
        edge.source().data('id') === targetNodeId
          ? edge.target()
          : edge.source();
      if (endPoint != null) {
        endPoints.push(endPoint);
      }
    });
    if (endPoints.length === 2) {
      const directNeighborNode = endPoints[0]
        .neighborhood()
        .filter(
          n =>
            n.data('type') === 'node' &&
            n.data('id') === endPoints[1].data('id'),
        );
      if (directNeighborNode.length > 0) {
        bypassed = true;
      }
    }
  }

  // 削除後に設定する各ノードの位置リストです。
  const newNodePositions: NodePosition[] = [];
  setElementData(elements => {
    const removingEdgeDataList = elements.filter(
      x => x.data.type === 'edge' && x.data.source === targetNodeId,
    );
    const removingEdgeData: ElementDefinition | null =
      removingEdgeDataList.length > 0 ? removingEdgeDataList[0] : null;
    const newElements: ElementDefinition[] = [];
    elements.forEach(elem => {
      const newElem = cloneElement(elem);
      if (newElem.data.type === 'node') {
        if (newElem.data.id === targetNodeId) {
          return;
        }
      } else if (newElem.data.type === 'edge') {
        if (newElem.data.source === targetNodeId) {
          return;
        }
        if (bypassed && newElem.data.target === targetNodeId) {
          return;
        }
        if (removingEdgeData !== null) {
          const removingEdgeId = parseInt(removingEdgeData.data.edgeId);
          const edgeId = parseInt(newElem.data.edgeId);
          if (newElem.data.target === targetNodeId) {
            newElem.data.target = removingEdgeData.data.target;
            newElem.data.id = `${newElem.data.source}-${newElem.data.target}`;
          }
          if (edgeId > removingEdgeId) {
            newElem.data.edgeId = `${edgeId - 1}`;
            newElem.data.label = `Edge${newElem.data.edgeId}`;
          }
        }
      }
      newElements.push(newElem);
    }); // elements foreachs

    const newNodeIdMap: { [key: string]: string } = {};
    // ノードとエッジの ID を更新します。
    const updatedElementData = updateNodeAndEdgeId(newElements, newNodeIdMap);

    // 新しいノードの位置データを取得します。
    cyRef.current?.nodes().forEach((node: any) => {
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
  if (targetNode.length > 0) {
    targetNode.unselect();
  }
}
