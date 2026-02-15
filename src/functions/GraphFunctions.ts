import {
  Core,
  EdgeCollection,
  ElementDefinition,
  Stylesheet,
  StylesheetStyle,
  Css,
} from 'cytoscape';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';

import {
  cloneElement,
  compareEdges,
  compareNodes,
  createColors,
  edgeDataEqual,
  getEdgeData,
} from './UtilFunctions';
import { Settings } from '../Settings';
import { NodePosition } from '../components/NodePosition';

/**
 * グラフのデータに追加する新しいエッジを取得します。
 * @param {EdgeCollection} edges 元となるエッジの集合。
 * @param {ElementDefinition} elements グラフのデータ
 * @return {EdgeCollection} グラフのデータに追加する新しいエッジの集合
 */
export function getNewEdges(
  edges: EdgeCollection,
  elements: ElementDefinition[],
): EdgeCollection {
  return edges.filter(edge => {
    if (edge.data('type') !== 'edge') {
      return false;
    }
    return elements.every(
      elem => !edgeDataEqual(edge.source().id(), edge.target().id(), elem),
    );
  });
}

/**
 * エッジのデータをグラフのデータに追加します。
 * @param {string} source 追加するエッジのソース
 * @param {string} target 追加するエッジのターゲット
 * @param {ElementDefinition[]} elements グラフのデータ
 * @return {ElementDefinition[]} エッジのデータを追加した後のグラフのデータ
 */
export function addEdgeData(
  source: string,
  target: string,
  elements: ElementDefinition[],
): ElementDefinition[] {
  const adding = elements.every(elem => !edgeDataEqual(source, target, elem));
  if (!adding) {
    return elements;
  } else {
    const newElements = [...elements];
    newElements.push(getEdgeData(source, target, Infinity));
    return updateNodeAndEdgeId(newElements);
  }
}

/**
 * 与えられたノードの開始位置フラグを変更したデータを取得します。
 * @param {string} targetId 変更対象となるノードの ID
 * @param {boolean} startState 変更後の状態
 * @param {ElementDefinition[]} elements グラフ データ
 * @return { ElementDefinition[]} 変更後のデータ
 */
export function getStartFlagChangedData(
  targetId: string,
  startState: boolean,
  elements: ElementDefinition[],
): ElementDefinition[] {
  const newElements = [...elements];
  const target = newElements.find(elem => {
    return elem.data.type === 'node' && elem.data.id === targetId;
  });
  if (target === undefined) {
    return newElements;
  }
  target.data.isstart = startState;
  return newElements;
}

/**
 * 与えられたエッジの開始位置フラグを変更したデータを取得します。
 * @param {string} targetId 変更対象となるノードの ID
 * @param {boolean} startState 変更後の状態
 * @param {ElementDefinition[]} elements グラフ データ
 * @return { ElementDefinition[]} 変更後のデータ
 */
export function getEdgeTypeStartFlagChangedData(
  targetId: string,
  startState: boolean,
  elements: ElementDefinition[],
): ElementDefinition[] {
  const newElements = [...elements];
  const target = newElements.find(elem => {
    return elem.data.type === 'edge' && elem.data.edgeId === targetId;
  });
  if (target === undefined) {
    return newElements;
  }
  target.data.isstart = startState;
  return newElements;
}

/**
 * 与えられたノードの目標位置フラグを変更したデータを取得します。
 * @param {string} targetId 変更対象となるノードの ID
 * @param {boolean} targetState 変更後の状態
 * @param {ElementDefinition[]} elements グラフ データ
 * @return { ElementDefinition[]} 変更後のデータ
 */
export function getTargetFlagChangedData(
  targetId: string,
  targetState: boolean,
  elements: ElementDefinition[],
): ElementDefinition[] {
  const newElements = [...elements];
  const target = newElements.find(elem => {
    return elem.data.type === 'node' && elem.data.id === targetId;
  });
  if (target === undefined) {
    return newElements;
  }
  target.data.istarget = targetState;
  return newElements;
}

/**
 * 与えられたエッジの目標位置フラグを変更したデータを取得します。
 * @param {string} targetId 変更対象となるノードの ID
 * @param {boolean} targetState 変更後の状態
 * @param {ElementDefinition[]} elements グラフ データ
 * @return { ElementDefinition[]} 変更後のデータ
 */
export function getEdgeTypeTargetFlagChangedData(
  targetId: string,
  targetState: boolean,
  elements: ElementDefinition[],
): ElementDefinition[] {
  const newElements = [...elements];
  const target = newElements.find(elem => {
    return elem.data.type === 'edge' && elem.data.edgeId === targetId;
  });
  if (target === undefined) {
    return newElements;
  }

  target.data.istarget = targetState;
  return newElements;
}

/**
 * 与えられたノードの色インデックスを変更したデータを取得します。
 * @param {string} targetId 変更対象となるノードの ID
 * @param {number} newColorIndex 変更後の色インデックス
 * @param {boolean} forStartGraph 開始グラフを対象としているかどうかを表すフラグ
 * @param {ElementDefinition[]} elements グラフ データ
 * @param {boolean} forNodeType 頂点彩色タイプを対象とするかどうかを表すフラグ
 * @return { ElementDefinition[]} 変更後のデータ
 */
export function getColorIndexChangedData(
  targetId: string,
  newColorIndex: number,
  forStartGraph: boolean,
  elements: ElementDefinition[],
  forNodeType: boolean,
): ElementDefinition[] {
  const newElements = [...elements];
  let target: ElementDefinition | undefined = undefined;
  if (forNodeType) {
    target = newElements.find(elem => {
      return elem.data.type === 'node' && elem.data.id === targetId;
    });
  } else {
    target = newElements.find(elem => {
      return elem.data.type === 'edge' && elem.data.edgeId === targetId;
    });
  }
  if (target === undefined) {
    return newElements;
  }
  if (forStartGraph) {
    target.data.startcolorindex = newColorIndex;
  } else {
    target.data.targetcolorindex = newColorIndex;
  }
  return newElements;
}

/**
 * ノードがクリックされた場合の開始独立集合状態の処理ハンドラを取得します。
 * @param {Dispatch<SetStateAction<ElementDefinition[]>> } setElementData 要素を更新するための関数
 * @param {MutableRefObject<string>} problemTypeRef 問題タイプの参照
 * @return {getStartStateHandler~handler} 開始独立集合状態の処理ハンドラ
 */
export function getStartStateHandler(
  setElementData: Dispatch<SetStateAction<ElementDefinition[]>>,
  problemTypeRef: MutableRefObject<string>,
): (e: any) => void {
  const handler = (event: any) => {
    if (problemTypeRef.current === 'vertex') {
      const target = event.target;

      if (target.data('type') !== 'node') {
        return;
      }

      // 対象のノードが開始位置ノードの場合は、
      // 開始位置フラグを落とし、開始位置用のスタイルを削除します。
      if (target.data('isstart')) {
        target.removeClass('start-state');
        target.data('isstart', false);
        setElementData(elements =>
          getStartFlagChangedData(target.data('id'), false, elements),
        );
        // 対象のノードが開始位置ノードでない場合は、
        // 開始位置フラグを立て、開始位置用のスタイルを追加します。
      } else {
        target.data('isstart', true);
        target.addClass('start-state');
        setElementData(elements =>
          getStartFlagChangedData(target.data('id'), true, elements),
        );
      }
    } else if (problemTypeRef.current === 'edge') {
      const target = event.target;
      if (target.data('type') !== 'edge') {
        return;
      }

      // 対象のエッジが開始位置ノードの場合は、
      // 開始位置フラグを落とし、開始位置用のスタイルを削除します。
      if (target.data('isstart')) {
        target.removeClass('start-state');
        target.data('isstart', false);
        setElementData(elements =>
          getEdgeTypeStartFlagChangedData(
            target.data('edgeId'),
            false,
            elements,
          ),
        );
        // 対象のエッジが開始位置ノードでない場合は、
        // 開始位置フラグを立て、開始位置用のスタイルを追加します。
      } else {
        target.data('isstart', true);
        target.addClass('start-state');
        setElementData(elements =>
          getEdgeTypeStartFlagChangedData(
            target.data('edgeId'),
            true,
            elements,
          ),
        );
      }
    }
  };

  return handler;
}

/**
 * エッジがクリックされた場合の開始独立集合状態の処理ハンドラを取得します。
 * @param {Dispatch<SetStateAction<ElementDefinition[]>> } setElementData クリック時のイベント
 * @return {getStartStateHandler~handler} 開始独立集合状態の処理ハンドラ
 */
export function getEdgeTypeStartStateHandler(
  setElementData: Dispatch<SetStateAction<ElementDefinition[]>>,
): (e: any) => void {
  const handler = (event: any) => {
    const target = event.target;
    if (target.data('type') !== 'edge') {
      return;
    }

    // 対象のエッジが開始位置ノードの場合は、
    // 開始位置フラグを落とし、開始位置用のスタイルを削除します。
    if (target.data('isstart')) {
      target.removeClass('start-state');
      target.data('isstart', false);
      setElementData(elements =>
        getEdgeTypeStartFlagChangedData(target.data('edgeId'), false, elements),
      );
      // 対象のエッジが開始位置ノードでない場合は、
      // 開始位置フラグを立て、開始位置用のスタイルを追加します。
    } else {
      target.data('isstart', true);
      target.addClass('start-state');
      setElementData(elements =>
        getEdgeTypeStartFlagChangedData(target.data('edgeId'), true, elements),
      );
    }
  };
  return handler;
}

/**
 * ノードのクリック時に色インデックスを更新するハンドラを取得します。
 * @param {Dispatch<SetStateAction<ElementDefinition[]>> } setElementData 要素を更新するための関数
 * @param {number | undefined} numColor 彩色の色数
 * @param {boolean} forStartGraph 開始集合用のハンドラを取得するかどうかを表すフラグ
 * @param {boolean} increments インデックスをインクリメントするかどうかを表すフラグ
 * @param {boolean} forNodeType 頂点彩色タイプを対象とするかどうかを表すフラグ
 * @param {MutableRefObject<boolean> | null} manipulationModeRef ノード細分、またはノード短絡モード フラグの参照
 * @return {getStartStateHandler~handler} 色インデックスを更新するハンドラ
 */
export function getColorIndexHandler(
  setElementData: Dispatch<SetStateAction<ElementDefinition[]>>,
  numColor: number | undefined,
  forStartGraph: boolean,
  increments: boolean,
  forNodeType = true,
  manipulationModeRef: MutableRefObject<boolean> | null = null,
): (e: any) => void {
  const handler = (event: any) => {
    const target = event.target;

    if (forNodeType) {
      if (target.data('type') !== 'node' || numColor == null) {
        return;
      }
    } else {
      if (target.data('type') !== 'edge' || numColor == null) {
        return;
      }
    }

    // 操作モード (ノード細分、またはノード短絡モード) が有効の場合はなにもせず終了します。
    if (manipulationModeRef != null && manipulationModeRef?.current) {
      return;
    }

    // 対象のノードが開始位置ノードの場合は、
    // 開始位置フラグを落とし、開始位置用のスタイルを削除します。
    const curColorIndex = forStartGraph
      ? target.data('startcolorindex')
      : target.data('targetcolorindex');
    const curClass =
      curColorIndex >= 1 ? `color-index-${curColorIndex}` : `color-index-null`;
    target.removeClass(curClass);

    let newColorIndex = -1;
    if (increments) {
      newColorIndex = curColorIndex > 0 ? curColorIndex + 1 : 1;
      if (newColorIndex > numColor) {
        newColorIndex = numColor > 0 ? 1 : -1;
      }
    } else {
      newColorIndex = curColorIndex > 0 ? curColorIndex - 1 : numColor;
      if (newColorIndex <= 0) {
        newColorIndex = numColor > 0 ? numColor : -1;
      }
    }
    const newClass =
      newColorIndex >= 1 ? `color-index-${newColorIndex}` : `color-index-null`;

    if (forStartGraph) {
      target.data('startcolorindex', newColorIndex);
    } else {
      target.data('targetcolorindex', newColorIndex);
    }
    target.addClass(newClass);
    const targetId = forNodeType ? target.data('id') : target.data('edgeId');
    setElementData(elements =>
      getColorIndexChangedData(
        targetId,
        newColorIndex,
        forStartGraph,
        elements,
        forNodeType,
      ),
    );
  };

  return handler;
}

/**
 * ノードがクリックされた場合の終了独立集合状態の処理ハンドラを取得します。
 * @param {Dispatch<SetStateAction<ElementDefinition[]>> } setElementData クリック時のイベント
 * @param {MutableRefObject<string>} problemTypeRef 問題タイプの参照
 * @return {getTargetStateHandler~handler} 終了独立集合状態の処理ハンドラ
 */
export function getTargetStateHandler(
  setElementData: Dispatch<SetStateAction<ElementDefinition[]>>,
  problemTypeRef: MutableRefObject<string>,
): (e: any) => void {
  const handler = (event: any) => {
    if (problemTypeRef.current === 'vertex') {
      const target = event.target;

      if (target.data('type') !== 'node') {
        return;
      }

      // 対象のノードが目標位置ノードの場合は、
      // 開始位置フラグを落とし、目標位置用のスタイルを削除します。
      if (target.data('istarget')) {
        target.removeClass('target-state');
        target.data('istarget', false);
        setElementData(elements =>
          getTargetFlagChangedData(target.data('id'), false, elements),
        );
        // 対象のノードが目標位置ノードでない場合は、
        // 目標位置フラグを立て、目標位置用のスタイルを追加します。
      } else {
        target.data('istarget', true);
        target.addClass('target-state');
        setElementData(elements =>
          getTargetFlagChangedData(target.data('id'), true, elements),
        );
      }
    } else if (problemTypeRef.current === 'edge') {
      const target = event.target;
      if (target.data('type') !== 'edge') {
        return;
      }
      // 対象のエッジが目標位置エッジの場合は、
      // 開始位置フラグを落とし、目標位置用のスタイルを削除します。
      if (target.data('istarget')) {
        target.removeClass('target-state');
        target.data('istarget', false);
        setElementData(elements =>
          getEdgeTypeTargetFlagChangedData(
            target.data('edgeId'),
            false,
            elements,
          ),
        );
        // 対象のエッジが目標位置エッジでない場合は、
        // 目標位置フラグを立て、目標位置用のスタイルを追加します。
      } else {
        target.data('istarget', true);
        target.addClass('target-state');
        setElementData(elements =>
          getEdgeTypeTargetFlagChangedData(
            target.data('edgeId'),
            true,
            elements,
          ),
        );
      }
    }
  };
  return handler;
}

/**
 * エッジがクリックされた場合の終了独立集合状態の処理ハンドラを取得します。
 * @param {Dispatch<SetStateAction<ElementDefinition[]>> } setElementData クリック時のイベント
 * @return {getTargetStateHandler~handler} 終了独立集合状態の処理ハンドラ
 */
export function getEdgeTypeTargetStateHandler(
  setElementData: Dispatch<SetStateAction<ElementDefinition[]>>,
): (e: any) => void {
  const handler = (event: any) => {
    const target = event.target;
    if (target.data('type') !== 'edge') {
      return;
    }
    // 対象のエッジが目標位置エッジの場合は、
    // 開始位置フラグを落とし、目標位置用のスタイルを削除します。
    if (target.data('istarget')) {
      target.removeClass('target-state');
      target.data('istarget', false);
      setElementData(elements =>
        getEdgeTypeTargetFlagChangedData(
          target.data('edgeId'),
          false,
          elements,
        ),
      );
      // 対象のエッジが目標位置エッジでない場合は、
      // 目標位置フラグを立て、目標位置用のスタイルを追加します。
    } else {
      target.data('istarget', true);
      target.addClass('target-state');
      setElementData(elements =>
        getEdgeTypeTargetFlagChangedData(target.data('edgeId'), true, elements),
      );
    }
  };
  return handler;
}

/**
 * グラフを強制的に再描画します。
 * @param {Core} cy グラフのインスタンス
 */
export function forceRendering(cy: Core) {
  cy.nodes()
    .layout({
      name: 'preset',
      animate: false,
      fit: false,
      transform: node => {
        const position = { x: 0, y: 0 };
        position.x = node.position('x') + 0;
        position.y = node.position('y') + 0;
        return position;
      },
    })
    .run();
}

/**
 * ノードとエッジの ID を更新します。
 * @param {ElementDefinition[]} elements グラフのデータ
 * @param {Object | null} outNodeIdMap 新しいノードの ID のマップ
 * @return {ElementDefinition[]} 更新後のグラフ データ
 */
export function updateNodeAndEdgeId(
  elements: ElementDefinition[],
  outNodeIdMap: { [key: string]: string } | null = null,
): ElementDefinition[] {
  const newNodeIdMap: { [key: string]: string } = {};
  const nodeElements = elements.filter(elem => elem.data.type === 'node');

  // ノード データを ID 順に並べます。
  nodeElements.sort(compareNodes);

  // ノードの新しい ID を求めマップに登録します。
  for (let nodeIndex = 0; nodeIndex < nodeElements.length; nodeIndex++) {
    const curNode = nodeElements[nodeIndex];
    if (curNode.data.id !== undefined) {
      newNodeIdMap[curNode.data.id] = `${nodeIndex + 1}`;
      if (outNodeIdMap) {
        outNodeIdMap[curNode.data.id] = newNodeIdMap[curNode.data.id];
      }
    }
  }

  // 新しい ID を割り振ったノード データを作成します。
  const newElements: ElementDefinition[] = [];
  for (let nodeIndex = 0; nodeIndex < nodeElements.length; nodeIndex++) {
    const curNode = nodeElements[nodeIndex];
    const newData = cloneElement(curNode);
    if (curNode.data.id !== undefined) {
      newData.data.id = newNodeIdMap[curNode.data.id];
      newData.data.label = `Node${newData.data.id}`;
    }
    newElements.push(newData);
  }

  const edgeElements = elements.filter(elem => elem.data.type === 'edge');

  // エッジ データを ID 順に並べます。
  edgeElements.sort(compareEdges);

  // 端点のノードの ID を修正したエッジ データを作成します。
  for (let edgeIndex = 0; edgeIndex < edgeElements.length; edgeIndex++) {
    const curEdge = edgeElements[edgeIndex];
    const newData = cloneElement(curEdge);
    if (curEdge.data.source !== undefined) {
      newData.data.source = newNodeIdMap[curEdge.data.source];
    }
    if (curEdge.data.target !== undefined) {
      newData.data.target = newNodeIdMap[curEdge.data.target];
    }
    newData.data.id = `${newData.data.source}-${newData.data.target}`;
    newElements.push(newData);
  }

  // エッジの ID を割り振り直します。
  let newEdgeId = 1;
  newElements.forEach(elem => {
    if (elem.data.type === 'edge') {
      elem.data.edgeId = `${newEdgeId}`;
      elem.data.label = `Edge${newEdgeId}`;
      newEdgeId++;
    }
  });
  return newElements;
}

/**
 * 与えられたエッジを削除したグラフのデータを取得します。
 * @param {string} source エッジのソース
 * @param {string} target エッジのターゲット
 * @param {ElementDefinition[]} elements グラフのデータ
 * @return {ElementDefinition[]} エッジを削除後のグラフのデータ
 */
export function getEdgeRemoved(
  source: string,
  target: string,
  elements: ElementDefinition[],
): ElementDefinition[] {
  const newElements = [...elements].filter(elem => {
    if (elem.data.type === 'node') {
      return true;
    } else if (elem.data.type === 'edge') {
      return !edgeDataEqual(source, target, elem);
    } else {
      return false;
    }
  });
  return updateNodeAndEdgeId(newElements);
}

/**
 * グラフの要素データにノードのデータを追加します。
 * @param {ElementDefinition[]} elements  グラフの要素データ
 * @param {nodePositions} nodePositions ノードの位置データ
 */
export function appendNodeData(
  elements: ElementDefinition[],
  nodePositions: NodePosition[],
): void {
  nodePositions.forEach(nodePosition => {
    const data = elements.find(elem => {
      elem.data.id === nodePosition.id;
    });
    if (!data) {
      elements.push({
        data: {
          id: nodePosition.id,
          label: `Node${nodePosition.id}`,
          type: 'node',
          isstart: nodePosition.isStart,
          istarget: nodePosition.isTarget,
        },
      });
    }
  });
}

/**
 * グラフを描画領域の中心に移動します。
 * @param {Core} cy グラフのインスタンス
 * @param {boolean} fit グラフの大きさを調整するかどうかのフラグ
 */
export function moveToCenter(cy: Core, fit = true): void {
  const nodes = cy.nodes();
  if (nodes && nodes.length > 0) {
    const container = cy.container();
    if (container) {
      const centerX = container.offsetWidth / 2;
      const centerY = container.offsetHeight / 2;
      let mx = 0;
      let my = 0;

      nodes.forEach(node => {
        const pos = node.renderedPosition();
        mx += pos.x;
        my += pos.y;
      });

      mx = mx / nodes.length;
      my = my / nodes.length;
      const vec = { x: centerX - mx, y: centerY - my }; // pos -> center のベクトル
      cy.panBy(vec);
      if (fit) {
        cy.fit();
      }
    }
  }
}

/**
 * グラフをズームします。
 * @param {Core | null} cy グラフのインスタンス
 * @param {double} zoomFactor ズームのレベル
 */
export function zoom(cy: Core | null, zoomFactor: number): void {
  if (cy) {
    const container = cy.container();
    if (container) {
      const centerX = container.offsetWidth / 2;
      const centerY = container.offsetHeight / 2;
      cy.zoom({
        level: zoomFactor,
        renderedPosition: { x: centerX, y: centerY },
      });
    }
  }
}

/**
 * 辺タイプ用のスタイルシートを取得します。
 * @param {Styleseed[]} baseStyleSeet 元となるスタイルシート
 * @param {boolean} resetSelectedColor 選択時のエッジの色をリセットするかどうかのフラグ
 * @return {Styleseed[]} 辺タイプ用のスタイルシート
 */
export function getStyleSeetForEdgeType(
  baseStyleSeet: Stylesheet[],
): Stylesheet[] {
  const newStyleSheet = baseStyleSeet.filter(
    style => style.selector != 'node[label]',
  );
  newStyleSheet.push({
    selector: 'edge[label]',
    style: {
      label: 'data(label)',
    },
  });
  return newStyleSheet;
}

/**
 * 頂点彩色タイプ用のスタイルシートを取得します。
 * @param {Styleseed[]} baseStyleSeet 元となるスタイルシート
 * @param {number} numColor 彩色数
 * @return {Styleseed[]} 頂点彩色タイプ用のスタイルシート
 */
export function getStyleSeetForVColorType(
  baseStyleSeet: Stylesheet[],
  numColor?: number,
): Stylesheet[] {
  const newStyleSheet = Object.create(baseStyleSeet);
  if (numColor == null) {
    return newStyleSheet;
  }
  const colors = createColors(numColor);
  for (let colorIndex = 1; colorIndex <= numColor; colorIndex++) {
    newStyleSheet.push({
      selector: `node.color-index-${colorIndex}`,
      style: {
        'background-color': `${colors[colorIndex - 1]}`,
      },
    });
  }
  newStyleSheet.push({
    selector: 'node.color-index-null',
    style: {
      'background-color': `${colors[numColor]}`,
    },
  });
  return newStyleSheet;
}

/**
 * 辺彩色タイプ用のスタイルシートを取得します。
 * @param {Styleseed[]} baseStyleSeet 元となるスタイルシート
 * @param {number} numColor 彩色数
 * @return {Styleseed[]} 辺彩色タイプ用のスタイルシート
 */
export function getStyleSeetForEColorType(
  baseStyleSeet: Stylesheet[],
  numColor?: number,
): Stylesheet[] {
  const newStyleSheet = Object.create(baseStyleSeet);
  if (numColor == null) {
    return newStyleSheet;
  }
  const colors = createColors(numColor);
  for (let colorIndex = 1; colorIndex <= numColor; colorIndex++) {
    newStyleSheet.push({
      selector: `edge.color-index-${colorIndex}`,
      style: {
        'line-color': `${colors[colorIndex - 1]}`,
      },
    });
  }
  newStyleSheet.push({
    selector: 'edge.color-index-null',
    style: {
      'line-color': `${colors[numColor]}`,
    },
  });
  return newStyleSheet;
}

/**
 * 選択されたノードを削除します。
 * @param {MutableRefObject<Core | null>} cyRef グラフ インスタンスの参照
 * @param {ElementDefinition[]} curElements 現在のグラフ データ
 * @return {[ElementDefinition[], NodePosition[]]} 削除後のグラフ データとノード位置リスト
 */
export function removeSelectedNodes(
  cyRef: MutableRefObject<Core | null>,
  curElements: ElementDefinition[],
): [ElementDefinition[], NodePosition[]] {
  if (cyRef.current) {
    const selectedNodeIds = cyRef.current
      .nodes(':selected')
      .map(node => node.data('id'));
    const unselectedNodes = cyRef.current.nodes(':unselected');
    const newElements = [...curElements].filter(elem => {
      // 選択されていないノード集合に含まれるノード データを残します。
      if (elem.data.type === 'node') {
        return unselectedNodes.is(`#${elem.data.id}`);
      } else if (elem.data.type === 'edge') {
        // 選択されていないノード集合に始点と終点が含まれるエッジ データを残します。
        return (
          unselectedNodes.is(`#${elem.data.source}`) &&
          unselectedNodes.is(`#${elem.data.target}`)
        );
      }
      return false;
    });

    const newNodeIdMap: { [key: string]: string } = {};
    const updatedElementData = updateNodeAndEdgeId(newElements, newNodeIdMap);

    const newNodePositions: NodePosition[] = [];
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

    // 削除したノードと同じ ID を持つ新しいノードが削除操作後に選択状態となる場合がありります。
    // これを避けるために対象ノードを明示的に非選択状態にします。
    selectedNodeIds.forEach(removedNodeId => {
      const targetNode = cyRef.current?.getElementById(removedNodeId);
      if (targetNode) {
        targetNode.unselect();
      }
    });

    return [updatedElementData, newNodePositions];
  } else {
    return [[], []];
  }
}

/**
 * 色数を変更した場合のグラフ データを取得します。
 * @param {ElementDefinition[]} elements グラフ データ
 * @param {number | undefined} numColors 色数
 * @return {ElementDefinition[]} 色数を変更した場合のグラフ データ
 */
export function getColorNumberChangedData(
  elements: ElementDefinition[],
  numColors: number | undefined,
): ElementDefinition[] {
  if (numColors == null) {
    return [];
  }
  const newElements: ElementDefinition[] = [];
  // グラフ データの各要素の色インデックスを更新します。
  elements.forEach(elem => {
    const newElem = cloneElement(elem);
    const curStartColorIndex = newElem.data.startcolorindex;
    const curTargetColorIndex = newElem.data.targetcolorindex;
    // 新たな色インデックスを取得します。
    const newStartColorIndex =
      curStartColorIndex <= numColors ? curStartColorIndex : -1;
    const newTargetColorIndex =
      curTargetColorIndex <= numColors ? curTargetColorIndex : -1;
    // 取得した色インデックスを要素に設定します。
    newElem.data.startcolorindex = newStartColorIndex;
    newElem.data.targetcolorindex = newTargetColorIndex;
    // 作成したデータをリストに追加します。
    if (elem.data.id) {
      newElements.push(newElem);
    }
  });
  return newElements;
}

/**
 * 各ノードの色インデックスを表すクラスを更新します。
 * @param {MutableRefObject<Core | null> | null} cyRef グラフのインスタンスの参照
 * @param {ElementDefinition[]} elements 更新の際に参照されるグラフ データ
 * @param {boolean} forStartGraph 開始グラフを対象とするかどうかを表すフラグ
 * @param {boolean} forNodeType 頂点彩色タイプを対象とするかどうかを表すフラグ
 */
export function updateColorIndexClass(
  cyRef: MutableRefObject<Core | null> | null,
  elements: ElementDefinition[],
  forStartGraph: boolean,
  forNodeType = true,
) {
  if (cyRef && cyRef.current) {
    // 各ノード、またはエッジに設定されているクラスを削除します。
    removeColorIndexClass(cyRef, forNodeType);
    const newColorIndexMap: { [key: string]: number } = {};
    elements.forEach(elem => {
      // 色インデックスをマップに記録します。
      if (forNodeType) {
        if (elem.data.id && elem.data.type == 'node') {
          newColorIndexMap[elem.data.id] = forStartGraph
            ? elem.data.startcolorindex
            : elem.data.targetcolorindex;
        }
      } else {
        if (elem.data.edgeId && elem.data.type == 'edge') {
          newColorIndexMap[elem.data.edgeId] = forStartGraph
            ? elem.data.startcolorindex
            : elem.data.targetcolorindex;
        }
      }
    });
    // 各ノード、またはエッジに新たなクラスを追加します。
    cyRef.current.nodes().forEach(element => {
      let newIndex = forNodeType
        ? newColorIndexMap[element.data('id')]
        : newColorIndexMap[element.data('edgeId')];
      newIndex = newIndex !== undefined ? newIndex : -1;
      const newClass =
        newIndex >= 1 ? `color-index-${newIndex}` : `color-index-null`;
      element.addClass(newClass);
    });
  }
}

/**
 * 各ノードの色インデックスを表すクラスを削除します。
 * @param {MutableRefObject<Core | null> | null} cyRef グラフのインスタンスの参照
 * @param {boolean} forNodeType 頂点彩色タイプを対象とするかどうかを表すフラグ
 */
export function removeColorIndexClass(
  cyRef: MutableRefObject<Core | null> | null,
  forNodeType = true,
) {
  if (cyRef && cyRef.current) {
    if (forNodeType) {
      cyRef.current.nodes().forEach(element => {
        element.classes([]);
      });
    } else {
      cyRef.current.edges().forEach(element => {
        element.classes([]);
      });
    }
  }
}

/**
 *  彩色タイプにおけるノードまたはエッジクリック時のハンドラを設定します。
 * @param {Core | null} cy グラフのインスタンス
 * @param {Dispatch<SetStateAction<ElementDefinition[]>> } setElementData 要素を更新するための関数
 * @param {Dispatch<SetStateAction<any[]>> } setClickHandler クリック時のハンドラを保存するための関数
 * @param {number | undefined} numColors 色数
 * @param {boolean} forStartGraph 開始グラフを対象とするかどうかを表すフラグ
 * @param {boolean} forNodeType 頂点彩色タイプを対象とするかどうかを表すフラグ。false の場合は辺彩色タイプを対象とする。
 * @param {MutableRefObject<boolean> | null} manipulationModeRef ノード細分、またはノード短絡モード フラグの参照
 */
export function setClickHandlerForColorType(
  cy: Core | null,
  setElementData: Dispatch<SetStateAction<ElementDefinition[]>>,
  setClickHandler: Dispatch<SetStateAction<any[]>>,
  numColors: number | undefined,
  forStartGraph: boolean,
  forNodeType = true,
  manipulationModeRef: MutableRefObject<boolean> | null = null,
) {
  if (cy) {
    // ノード クリック時のハンドラを設定します。
    const leftClickHandler = getColorIndexHandler(
      setElementData,
      numColors,
      forStartGraph,
      true,
      forNodeType,
      manipulationModeRef,
    );
    const rightClickHandler = getColorIndexHandler(
      setElementData,
      numColors,
      forStartGraph,
      false,
      forNodeType,
      manipulationModeRef,
    );
    if (forNodeType) {
      cy.on('tap', 'node', leftClickHandler);
      cy.on('cxttap', 'node', rightClickHandler);
    } else {
      cy.on('tap', 'edge', leftClickHandler);
      cy.on('cxttap', 'edge', rightClickHandler);
    }
    setClickHandler([leftClickHandler, rightClickHandler]);
  }
}

/**
 * 与えられたアプリケーションの設定をもとにスタイル シートを取得します。
 * @param {Settings} settings アプリケーションの設定
 * @param {Stylesheet[]} srcStylesheet 変更前のスタイル シート
 * @return {Stylesheet[]} アプリケーションの設定をもとにしたスタイル シート
 */
export function getStylesheet(
  settings: Settings,
  srcStylesheet: Stylesheet[],
): Stylesheet[] {
  // 新たなスタイル シートのひながたを作成します。
  const newStyleSheet: Stylesheet[] = JSON.parse(JSON.stringify(srcStylesheet));
  // ノードのスタイルを取得します。
  const nodeStyles = newStyleSheet.filter(style => style.selector === 'node');
  let nodeStylesheet: StylesheetStyle | null = null;
  if (nodeStyles.length === 0) {
    nodeStylesheet = { selector: 'node', style: { width: 0, height: 0 } };
    newStyleSheet.push(nodeStylesheet);
  } else {
    nodeStylesheet = nodeStyles[0] as StylesheetStyle;
  }
  const nodeStyle = nodeStylesheet.style as Css.Node;
  // ノードの半径を設定します。
  const nodeRadius = Math.floor(settings.nodeRadius * 0.5);
  nodeStyle.width = nodeRadius;
  nodeStyle.height = nodeRadius;
  // ノードの枠幅を設定します。
  nodeStyle['border-width'] = settings.nodeBorderWidth;
  // ノードの通常色を設定します。
  nodeStyle['background-color'] = settings.normalNodeColor;
  // ノードの枠線の色を設定します。
  nodeStyle['border-color'] = settings.nodeBorderColor;
  // ノードのラベルを設定します。
  nodeStyle.label = settings.displayNodeLabel ? 'data(label)' : '';

  // 開始集合に属するノードのスタイルを取得します。
  const startNodeStyles = newStyleSheet.filter(
    style => style.selector === 'node.start-state',
  );
  let startNodeStylesheet: StylesheetStyle | null = null;
  if (startNodeStyles.length === 0) {
    startNodeStylesheet = { selector: 'node.start-state', style: {} };
    newStyleSheet.push(startNodeStylesheet);
  } else {
    startNodeStylesheet = startNodeStyles[0] as StylesheetStyle;
  }
  const startNodeStyle = startNodeStylesheet.style as Css.Node;
  // 開始集合に属するノードの色を設定します。
  startNodeStyle['background-color'] = settings.startNodeColor;

  // 目標集合に属するノードのスタイルを取得します。
  const targetNodeStyles = newStyleSheet.filter(
    style => style.selector === 'node.target-state',
  );
  let targetNodeStylesheet: StylesheetStyle | null = null;
  if (targetNodeStyles.length === 0) {
    targetNodeStylesheet = { selector: 'node.target-state', style: {} };
    newStyleSheet.push(targetNodeStylesheet);
  } else {
    targetNodeStylesheet = targetNodeStyles[0] as StylesheetStyle;
  }
  const targetNodeStyle = targetNodeStylesheet.style as Css.Node;
  // 目標集合に属するノードの色を設定します。
  targetNodeStyle['background-color'] = settings.targetNodeColor;

  // 解答中の遷移ステップに含まれるノードのスタイルを取得します。
  const answerNodeStyles = newStyleSheet.filter(
    style => style.selector === 'node.answer-state',
  );
  let answerNodeStylesheet: StylesheetStyle | null = null;
  if (answerNodeStyles.length === 0) {
    answerNodeStylesheet = { selector: 'node.answer-state', style: {} };
    newStyleSheet.push(answerNodeStylesheet);
  } else {
    answerNodeStylesheet = answerNodeStyles[0] as StylesheetStyle;
  }
  const answerNodeStyle = answerNodeStylesheet.style as Css.Node;
  // 目標集合に属するノードの色を設定します。
  answerNodeStyle['background-color'] = settings.answerNodeColor;

  // エッジのスタイルを取得します。
  const edgeStyles = newStyleSheet.filter(style => style.selector === 'edge');
  let edgeStylesheet: StylesheetStyle | null = null;
  if (edgeStyles.length === 0) {
    edgeStylesheet = { selector: 'edge', style: {} };
    newStyleSheet.push(edgeStylesheet);
  } else {
    edgeStylesheet = edgeStyles[0] as StylesheetStyle;
  }
  const edgeStyle = edgeStylesheet.style as Css.Edge;
  // エッジの幅を設定します。
  edgeStyle.width = settings.edgeWidth;
  // エッジの通常色を設定します。
  edgeStyle['line-color'] = settings.normalEdgeColor;
  // エッジのラベルを設定します。
  edgeStyle.label = settings.displayEdgeLabel ? 'data(label)' : '';

  // 開始集合に属するエッジのスタイルを取得します。
  const startEdgeStyles = newStyleSheet.filter(
    style => style.selector === 'edge.start-state',
  );
  let startEdgeStylesheet: StylesheetStyle | null = null;
  if (startEdgeStyles.length === 0) {
    startEdgeStylesheet = { selector: 'edge.start-state', style: {} };
    newStyleSheet.push(startEdgeStylesheet);
  } else {
    startEdgeStylesheet = startEdgeStyles[0] as StylesheetStyle;
  }
  const startEdgeStyle = startEdgeStylesheet.style as Css.Edge;
  // 開始集合に属するエッジの色を設定します。
  startEdgeStyle['line-color'] = settings.startEdgeColor;

  // 目標集合に属するエッジのスタイルを取得します。
  const targetEdgeStyles = newStyleSheet.filter(
    style => style.selector === 'edge.target-state',
  );
  let targetEdgeStylesheet: StylesheetStyle | null = null;
  if (targetEdgeStyles.length === 0) {
    targetEdgeStylesheet = { selector: 'edge.target-state', style: {} };
    newStyleSheet.push(targetEdgeStylesheet);
  } else {
    targetEdgeStylesheet = targetEdgeStyles[0] as StylesheetStyle;
  }
  const targetEdgeStyle = targetEdgeStylesheet.style as Css.Edge;
  // 目標集合に属するエッジの色を設定します。
  targetEdgeStyle['line-color'] = settings.targetEdgeColor;

  // 解答中の遷移ステップに含まれるエッジのスタイルを取得します。
  const answerEdgeStyles = newStyleSheet.filter(
    style => style.selector === 'edge.answer-state',
  );
  let answerEdgeStylesheet: StylesheetStyle | null = null;
  if (answerEdgeStyles.length === 0) {
    answerEdgeStylesheet = { selector: 'edge.answer-state', style: {} };
    newStyleSheet.push(answerEdgeStylesheet);
  } else {
    answerEdgeStylesheet = answerEdgeStyles[0] as StylesheetStyle;
  }
  const answerEdgeStyle = answerEdgeStylesheet.style as Css.Edge;
  // 解答中の遷移ステップに含まれるエッジのの色を設定します。
  answerEdgeStyle['line-color'] = settings.answerEdgeColor;

  return newStyleSheet;
}
