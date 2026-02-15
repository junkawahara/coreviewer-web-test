import {
  cloneElement,
  compareNodes,
  compareEdges,
  compareElements,
  edgeEqual,
  edgeDataEqual,
  getElementDataMap,
  getNodePositionData,
  getStartTargetIdMap,
} from './UtilFunctions';

/**
 * グラフ データをクローンする関数のテストです。
 */
test('cloneElement', () => {
  const element = {
    data: {
      id: '1',
      type: 'node',
      isstart: false,
      istarget: true,
      source: '10',
      target: '11',
      edgeId: '100',
      label: 'foo',
      customLayoutId: '3',
    },
  };
  // データをクローンします。
  const clone = cloneElement(element);
  // 結果を確認します。
  expect(clone.data.id).toBe('1');
  expect(clone.data.type).toBe('node');
  expect(clone.data.isstart).toBeFalsy();
  expect(clone.data.istarget).toBeTruthy();
  expect(clone.data.source).toBe('10');
  expect(clone.data.target).toBe('11');
  expect(clone.data.edgeId).toBe('100');
  expect(clone.data.label).toBe('foo');
  expect(clone.data.customLayoutId).toBe('3');
});

/**
 * エッジ データの等価性を判定する関数 (ソースとターゲットの情報のみで判定する関数) のテストです。
 */
test('edgeEqual', () => {
  // 各エッジ情報の等価性を判定し結果を確認します。
  expect(edgeEqual('1', '2', '1', '2')).toBeTruthy();
  expect(edgeEqual('1', '2', '2', '1')).toBeTruthy();
  expect(edgeEqual('1', '2', '3', '1')).toBeFalsy();
});

/**
 * エッジ データの等価性を判定する関数 (グラフ データのタイプも考慮して判定する関数) のテストです。
 */
test('edgeDataEqual', () => {
  // エッジ データを作成します。
  const element1 = {
    data: {
      type: 'edge',
      source: '1',
      target: '2',
    },
  };
  const element2 = {
    data: {
      type: 'edge',
      source: '1',
      target: '2',
    },
  };
  const element3 = {
    data: {
      type: 'edge',
      source: '3',
      target: '1',
    },
  };
  const element4 = {
    data: {
      type: 'node',
      source: '1',
      target: '2',
    },
  };
  // 各エッジ情報の等価性を判定し結果を確認します。
  expect(edgeDataEqual('1', '2', element1)).toBeTruthy();
  expect(edgeDataEqual('1', '2', element2)).toBeTruthy();
  expect(edgeDataEqual('1', '2', element3)).toBeFalsy();
  expect(edgeDataEqual('1', '2', element4)).toBeFalsy();
});

/**
 * 開始集合 ID と目標集合 ID のマップを取得する関数のテストです。
 * 頂点タイプの場合です。
 */
test('getStartTargetIdMapForVertexType', () => {
  // グラフ データを作成します。
  const elementData = [
    {
      data: {
        type: 'node',
        id: '1',
        isstart: false,
        istarget: true,
      },
    },
    {
      data: {
        type: 'node',
        id: '2',
        isstart: true,
        istarget: false,
      },
    },
    {
      data: {
        type: 'node',
        id: '3',
        isstart: false,
        istarget: true,
      },
    },
  ];

  // 開始集合 ID のマップと目標集合 ID のマップを取得します。
  const [startIdMap, targetIdMap] = getStartTargetIdMap(elementData, 'vertex');
  // 結果を確認します。
  expect(startIdMap['1']).toBeFalsy();
  expect(startIdMap['2']).toBeTruthy();
  expect(startIdMap['3']).toBeFalsy();
  expect(targetIdMap['1']).toBeTruthy();
  expect(targetIdMap['2']).toBeFalsy();
  expect(targetIdMap['3']).toBeTruthy();
});

/**
 * 開始集合 ID と目標集合 ID のマップを取得する関数のテストです。
 * 辺タイプの場合です。
 */
test('getStartTargetIdMapForEdgeType', () => {
  // グラフ データを作成します。
  const elementData = [
    {
      data: {
        type: 'edge',
        edgeId: '1',
        isstart: false,
        istarget: true,
      },
    },
    {
      data: {
        type: 'edge',
        edgeId: '2',
        isstart: true,
        istarget: false,
      },
    },
    {
      data: {
        type: 'edge',
        edgeId: '3',
        isstart: false,
        istarget: true,
      },
    },
  ];

  // 開始集合 ID のマップと目標集合 ID のマップを取得します。
  const [startIdMap, targetIdMap] = getStartTargetIdMap(elementData, 'edge');
  // 結果を確認します。
  expect(startIdMap['1']).toBeFalsy();
  expect(startIdMap['2']).toBeTruthy();
  expect(startIdMap['3']).toBeFalsy();
  expect(targetIdMap['1']).toBeTruthy();
  expect(targetIdMap['2']).toBeFalsy();
  expect(targetIdMap['3']).toBeTruthy();
});

/**
 * グラフ データ要素のマップを取得する関数のテストです。
 * 頂点タイプの場合です
 */
test('getElementDataMapForVertexType', () => {
  // グラフ データを作成します。
  const elementData = [
    {
      data: {
        type: 'node',
        id: '1',
        isstart: false,
        istarget: true,
      },
    },
    {
      data: {
        type: 'node',
        id: '2',
        isstart: true,
        istarget: false,
      },
    },
    {
      data: {
        type: 'node',
        id: '3',
        isstart: false,
        istarget: true,
      },
    },
  ];

  // 開始集合 ID のマップと目標集合 ID のマップを取得します。
  const elementMap = getElementDataMap(elementData, 'vertex');
  // 結果を確認します。
  expect(elementMap['1'].data.id).toBe('1');
  expect(elementMap['2'].data.id).toBe('2');
  expect(elementMap['3'].data.id).toBe('3');
});

/**
 * グラフ データ要素のマップを取得する関数のテストです。
 * 辺タイプの場合です
 */
test('getElementDataMapForEdgeType', () => {
  // グラフ データを作成します。
  const elementData = [
    {
      data: {
        type: 'edge',
        edgeId: '1',
        isstart: false,
        istarget: true,
      },
    },
    {
      data: {
        type: 'edge',
        edgeId: '2',
        isstart: true,
        istarget: false,
      },
    },
    {
      data: {
        type: 'edge',
        edgeId: '3',
        isstart: false,
        istarget: true,
      },
    },
  ];

  // 開始集合 ID のマップと目標集合 ID のマップを取得します。
  const elementMap = getElementDataMap(elementData, 'edge');
  // 結果を確認します。
  expect(elementMap['1'].data.edgeId).toBe('1');
  expect(elementMap['2'].data.edgeId).toBe('2');
  expect(elementMap['3'].data.edgeId).toBe('3');
});

/**
 * ノードの位置データのひな形を作成するかんすうのテストです。
 */
test('getNodePositionData', () => {
  // グラフ データを作成します。
  const element = {
    data: {
      type: 'node',
      id: '1',
      isstart: false,
      istarget: true,
    },
    selected: true,
  };

  // ノードの位置データのひな形を作成します。
  const nodePosition = getNodePositionData(element);
  // 結果を確認します。
  expect(nodePosition.id).toBe('1');
  expect(nodePosition.isStart).toBeFalsy();
  expect(nodePosition.isTarget).toBeTruthy();
  expect(nodePosition.isSelected).toBeTruthy();
});

/**
 * ノード データ同士を比較する関数のテストです。
 */
test('compareNodes', () => {
  // グラフ データを作成します。
  const element1 = {
    data: {
      type: 'node',
      id: '1',
    },
  };
  const element2 = {
    data: {
      type: 'node',
      id: '2',
    },
  };

  // ノード データ同士を比較し結果を確認します。
  expect(compareNodes(element1, element2)).toBe(-1);
  expect(compareNodes(element2, element1)).toBe(1);
  expect(compareNodes(element1, element1)).toBe(0);
});

/**
 * エッジ データ同士を比較する関数のテストです。
 */
test('compareEdges', () => {
  // グラフ データを作成します。
  const element1 = {
    data: {
      type: 'edge',
      edgeId: '1',
    },
  };
  const element2 = {
    data: {
      type: 'edge',
      edgeId: '2',
    },
  };

  // エッジ データ同士を比較し結果を確認します。
  expect(compareEdges(element1, element2)).toBe(-1);
  expect(compareEdges(element2, element1)).toBe(1);
  expect(compareEdges(element1, element1)).toBe(0);
});

/**
 * グラフのデータ要素同士を比較する関数のテストです。
 */
test('compareElements', () => {
  // グラフ データを作成します。
  // グラフ データを作成します。
  const element1 = {
    data: {
      type: 'node',
      id: '1',
    },
  };
  const element2 = {
    data: {
      type: 'node',
      id: '2',
    },
  };
  const element3 = {
    data: {
      type: 'edge',
      edgeId: '1',
    },
  };
  const element4 = {
    data: {
      type: 'edge',
      edgeId: '2',
    },
  };

  // エッジ データ同士を比較し結果を確認します。
  expect(compareElements(element1, element2)).toBe(-1);
  expect(compareElements(element1, element3)).toBe(-1);
  expect(compareElements(element2, element1)).toBe(1);
  expect(compareElements(element3, element1)).toBe(1);
  expect(compareElements(element1, element1)).toBe(0);
  expect(compareElements(element3, element3)).toBe(0);
  expect(compareElements(element3, element4)).toBe(-1);
  expect(compareElements(element4, element3)).toBe(1);
});
