import {
  getColorIndexChangedData,
  addEdgeData,
  getEdgeRemoved,
  getStartFlagChangedData,
  getTargetFlagChangedData,
  getStyleSeetForEColorType,
  getStyleSeetForVColorType,
  getColorNumberChangedData,
} from './GraphFunctions';
import { ElementDefinition, Stylesheet } from 'cytoscape';

/**
 * グラフ データにエッジ データを追加する関数のテストです。
 */
test('addEdgeDataTest', () => {
  // 要素を追加できるケースです。
  {
    const elm: ElementDefinition[] = [
      { data: { id: '1', type: 'node' } },
      { data: { id: '2', type: 'node' } },
    ];
    const expected: ElementDefinition[] = [
      {
        data: {
          id: '1',
          type: 'node',
          isstart: undefined,
          istarget: undefined,
          source: undefined,
          target: undefined,
          startcolorindex: undefined,
          targetcolorindex: undefined,
          label: '1',
          customLayoutId: undefined,
          edgeId: undefined,
        },
      },
      {
        data: {
          id: '2',
          type: 'node',
          isstart: undefined,
          istarget: undefined,
          source: undefined,
          target: undefined,
          startcolorindex: undefined,
          targetcolorindex: undefined,
          label: '2',
          customLayoutId: undefined,
          edgeId: undefined,
        },
      },
      {
        data: {
          id: '1-2',
          edgeId: '1',
          source: '1',
          target: '2',
          type: 'edge',
          label: 'Edge1',
          isstart: false,
          istarget: false,
          startcolorindex: undefined,
          targetcolorindex: undefined,
          customLayoutId: undefined,
        },
      },
    ];
    expect(addEdgeData('1', '2', elm)).toStrictEqual(expected);
  }
  // 要素を追加できないケースです。
  {
    const elm: ElementDefinition[] = [
      { data: { id: '1', type: 'node' } },
      { data: { id: '1-2', source: '1', target: '2', type: 'edge' } },
    ];
    const expected: ElementDefinition[] = [
      {
        data: {
          id: '1',
          type: 'node',
        },
      },
      {
        data: {
          id: '1-2',
          source: '1',
          target: '2',
          type: 'edge',
        },
      },
    ];
    expect(addEdgeData('1', '2', elm)).toStrictEqual(expected);
  }
});

/**
 * 特定のエッジを除去したグラフ データを取得する関数のテストです。
 */
test('getEdgeRemoved', () => {
  // エッジを除去したデータを取得するケースです。
  {
    const input: ElementDefinition[] = [
      { data: { id: '1', type: 'node' } },
      { data: { id: '2', type: 'node' } },
      { data: { id: '3', type: 'node' } },
      { data: { source: '1', target: '2', type: 'edge' } },
      { data: { source: '2', target: '3', type: 'edge' } },
    ];
    const expected: ElementDefinition[] = [
      {
        data: {
          id: '1',
          type: 'node',
          isstart: undefined,
          istarget: undefined,
          source: undefined,
          target: undefined,
          startcolorindex: undefined,
          targetcolorindex: undefined,
          label: '1',
          customLayoutId: undefined,
          edgeId: undefined,
        },
      },
      {
        data: {
          id: '2',
          type: 'node',
          isstart: undefined,
          istarget: undefined,
          source: undefined,
          target: undefined,
          startcolorindex: undefined,
          targetcolorindex: undefined,
          label: '2',
          customLayoutId: undefined,
          edgeId: undefined,
        },
      },
      {
        data: {
          id: '3',
          type: 'node',
          isstart: undefined,
          istarget: undefined,
          source: undefined,
          target: undefined,
          startcolorindex: undefined,
          targetcolorindex: undefined,
          label: '3',
          customLayoutId: undefined,
          edgeId: undefined,
        },
      },
      {
        data: {
          id: '2-3',
          edgeId: '1',
          source: '2',
          target: '3',
          type: 'edge',
          label: 'Edge1',
          isstart: undefined,
          istarget: undefined,
          startcolorindex: undefined,
          targetcolorindex: undefined,
          customLayoutId: undefined,
        },
      },
    ];
    expect(getEdgeRemoved('2', '1', input)).toStrictEqual(expected);
  }
  // 与えられたエッジがデータ中に存在しないため除去が行われないケースです。
  {
    const input: ElementDefinition[] = [
      { data: { id: '1', type: 'node' } },
      { data: { id: '2', type: 'node' } },
    ];
    const expected: ElementDefinition[] = [
      {
        data: {
          id: '1',
          type: 'node',
          isstart: undefined,
          istarget: undefined,
          source: undefined,
          target: undefined,
          startcolorindex: undefined,
          targetcolorindex: undefined,
          label: '1',
          customLayoutId: undefined,
          edgeId: undefined,
        },
      },
      {
        data: {
          id: '2',
          type: 'node',
          isstart: undefined,
          istarget: undefined,
          source: undefined,
          target: undefined,
          startcolorindex: undefined,
          targetcolorindex: undefined,
          label: '2',
          customLayoutId: undefined,
          edgeId: undefined,
        },
      },
    ];
    expect(getEdgeRemoved('1', '4', input)).toStrictEqual(expected);
  }
});

/**
 * 開始位置フラグを変更したグラフ データを取得する関数のテストです。
 */
test('getStartFlagChangedData', () => {
  // 開始位置フラグを true に変更するケースです。
  {
    const input: ElementDefinition[] = [
      { data: { id: 'one', type: 'node', isstart: false } },
      { data: { id: 'two', type: 'node', isstart: true } },
      { data: { source: 'one', target: 'two', type: 'edge' } },
    ];
    const expected: ElementDefinition[] = [
      { data: { id: 'one', type: 'node', isstart: true } },
      { data: { id: 'two', type: 'node', isstart: true } },
      { data: { source: 'one', target: 'two', type: 'edge' } },
    ];
    expect(getStartFlagChangedData('one', true, input)).toStrictEqual(expected);
  }
  // 開始位置フラグを false に変更するケースです。
  {
    const input: ElementDefinition[] = [
      { data: { id: 'one', type: 'node', isstart: false } },
      { data: { id: 'two', type: 'node', isstart: true } },
      { data: { source: 'one', target: 'two', type: 'edge' } },
    ];
    const expected: ElementDefinition[] = [
      { data: { id: 'one', type: 'node', isstart: false } },
      { data: { id: 'two', type: 'node', isstart: false } },
      { data: { source: 'one', target: 'two', type: 'edge' } },
    ];
    expect(getStartFlagChangedData('two', false, input)).toStrictEqual(
      expected,
    );
  }
  // 対象のノードがデータ内に存在しないケースです。
  {
    const input: ElementDefinition[] = [
      { data: { id: 'one', type: 'node', isstart: false } },
      { data: { id: 'two', type: 'node', isstart: true } },
      { data: { source: 'one', target: 'two', type: 'edge' } },
    ];
    const expected: ElementDefinition[] = [
      { data: { id: 'one', type: 'node', isstart: false } },
      { data: { id: 'two', type: 'node', isstart: true } },
      { data: { source: 'one', target: 'two', type: 'edge' } },
    ];
    expect(getStartFlagChangedData('four', false, input)).toStrictEqual(
      expected,
    );
  }
});

/**
 * 目標位置フラグを変更したグラフ データを取得する関数のテストです。
 */
test('getTargetStateChangedData', () => {
  // 目標位置フラグを true に変更するケースです。
  {
    const input: ElementDefinition[] = [
      { data: { id: 'one', type: 'node', isstart: false, istarget: false } },
      { data: { id: 'two', type: 'node', isstart: true, istarget: true } },
      { data: { source: 'one', target: 'two', type: 'edge' } },
    ];
    const expected: ElementDefinition[] = [
      { data: { id: 'one', type: 'node', isstart: false, istarget: true } },
      { data: { id: 'two', type: 'node', isstart: true, istarget: true } },
      { data: { source: 'one', target: 'two', type: 'edge' } },
    ];
    expect(getTargetFlagChangedData('one', true, input)).toStrictEqual(
      expected,
    );
  }
  // 目標位置フラグを false に変更するケースです。
  {
    const input: ElementDefinition[] = [
      { data: { id: 'one', type: 'node', isstart: false, istarget: false } },
      { data: { id: 'two', type: 'node', isstart: true, istarget: true } },
      { data: { source: 'one', target: 'two', type: 'edge' } },
    ];
    const expected: ElementDefinition[] = [
      { data: { id: 'one', type: 'node', isstart: false, istarget: false } },
      { data: { id: 'two', type: 'node', isstart: true, istarget: false } },
      { data: { source: 'one', target: 'two', type: 'edge' } },
    ];
    expect(getTargetFlagChangedData('two', false, input)).toStrictEqual(
      expected,
    );
  }
  // 目標位置フラグがデータ内に存在しないケースです。
  {
    const input: ElementDefinition[] = [
      { data: { id: 'one', type: 'node', isstart: false, istarget: false } },
      { data: { id: 'two', type: 'node', isstart: true, istarget: true } },
      { data: { source: 'one', target: 'two', type: 'edge' } },
    ];
    const expected: ElementDefinition[] = [
      { data: { id: 'one', type: 'node', isstart: false, istarget: false } },
      { data: { id: 'two', type: 'node', isstart: true, istarget: true } },
      { data: { source: 'one', target: 'two', type: 'edge' } },
    ];
    expect(getTargetFlagChangedData('four', false, input)).toStrictEqual(
      expected,
    );
  }
});

/**
 * 与えられたノードの色インデックスを変更したデータを取得する関数のテストです。
 * 開始グラフを対象とする場合です。
 */
test('getColorIndexChangedDataForStartGraph', () => {
  const input: ElementDefinition[] = [
    {
      data: {
        id: 'one',
        type: 'node',
        isstart: false,
        istarget: false,
        startcolorindex: 1,
        targetcolorindex: 2,
      },
    },
    {
      data: {
        id: 'two',
        type: 'node',
        isstart: true,
        istarget: true,
        startcolorindex: 10,
        targetcolorindex: 20,
      },
    },
    { data: { source: 'one', target: 'two', type: 'edge' } },
  ];
  const expected: ElementDefinition[] = [
    {
      data: {
        id: 'one',
        type: 'node',
        isstart: false,
        istarget: false,
        startcolorindex: 1,
        targetcolorindex: 2,
      },
    },
    {
      data: {
        id: 'two',
        type: 'node',
        isstart: true,
        istarget: true,
        startcolorindex: 100,
        targetcolorindex: 20,
      },
    },
    { data: { source: 'one', target: 'two', type: 'edge' } },
  ];

  // 開始色インデックスが正しく更新されたことを確認します。
  expect(getColorIndexChangedData('two', 100, true, input, true)).toStrictEqual(
    expected,
  );
});

/**
 * 与えられたノードの色インデックスを変更したデータを取得する関数のテストです。
 * 目標グラフを対象とする場合です。
 */
test('getColorIndexChangedDataForTargetGraph', () => {
  const input: ElementDefinition[] = [
    {
      data: {
        id: 'one',
        type: 'node',
        isstart: false,
        istarget: false,
        startcolorindex: 1,
        targetcolorindex: 2,
      },
    },
    {
      data: {
        id: 'two',
        type: 'node',
        isstart: true,
        istarget: true,
        startcolorindex: 10,
        targetcolorindex: 20,
      },
    },
    { data: { source: 'one', target: 'two', type: 'edge' } },
  ];
  const expected: ElementDefinition[] = [
    {
      data: {
        id: 'one',
        type: 'node',
        isstart: false,
        istarget: false,
        startcolorindex: 1,
        targetcolorindex: 200,
      },
    },
    {
      data: {
        id: 'two',
        type: 'node',
        isstart: true,
        istarget: true,
        startcolorindex: 10,
        targetcolorindex: 20,
      },
    },
    { data: { source: 'one', target: 'two', type: 'edge' } },
  ];

  // 目標色インデックスが正しく更新されたことを確認します。
  expect(
    getColorIndexChangedData('one', 200, false, input, true),
  ).toStrictEqual(expected);
});

// 頂点彩色問題用のスタイル シートを取得する関数のテストです。
test('getStyleSeetForVColorType', () => {
  const stylesheet = getStyleSeetForVColorType(
    [
      {
        selector: 'node[label]',
        style: {
          label: 'data(label)',
        },
      },
    ],
    3,
  );
  // 正しいスタイル シートが取得されたことを確認します。
  expect(stylesheet[0]['selector']).toBe('node[label]');
  expect(stylesheet[1]['selector']).toBe('node.color-index-1');
  expect(stylesheet[2]['selector']).toBe('node.color-index-2');
  expect(stylesheet[3]['selector']).toBe('node.color-index-3');
  expect(stylesheet[4]['selector']).toBe('node.color-index-null');
});

test('getStartFlagChangedData', () => {
  const baseStylesheet: Stylesheet[] = [];
  const stylesheet = getStyleSeetForVColorType(baseStylesheet, 2);

  // 正しいセレクタをもつスタイルが作成されたことを確認します。
  expect(stylesheet[0]['selector']).toBe('node.color-index-1');
  expect(stylesheet[1]['selector']).toBe('node.color-index-2');
  expect(stylesheet[2]['selector']).toBe('node.color-index-null');
});

// 与えられた色数に基づいて更新したグラフ データを取得する関数のテストです。
test('getColorNumberChangedDataForStartGraph', () => {
  const input: ElementDefinition[] = [
    {
      data: {
        id: 'one',
        type: 'node',
        isstart: false,
        istarget: false,
        startcolorindex: 1,
        targetcolorindex: 2,
      },
    },
    {
      data: {
        id: 'two',
        type: 'node',
        isstart: true,
        istarget: true,
        startcolorindex: 3,
        targetcolorindex: 4,
      },
    },
    { data: { source: 'one', target: 'two', type: 'edge' } },
  ];

  // 色数を更新します。
  const newElements = getColorNumberChangedData(input, 2);

  // グラフ データが正しく更新されたことを確認します。
  expect(newElements[0].data.startcolorindex).toBe(1);
  expect(newElements[0].data.targetcolorindex).toBe(2);
  expect(newElements[1].data.startcolorindex).toBe(-1);
  expect(newElements[1].data.targetcolorindex).toBe(-1);
});

// 辺彩色問題用のスタイル シートを取得する関数のテストです。
test('getStyleSeetForEColorType', () => {
  const stylesheet = getStyleSeetForEColorType(
    [
      {
        selector: 'edge',
        style: {},
      },
    ],
    3,
  );
  // 正しいスタイル シートが取得されたことを確認します。
  expect(stylesheet[1]['selector']).toBe('edge.color-index-1');
  expect(stylesheet[2]['selector']).toBe('edge.color-index-2');
  expect(stylesheet[3]['selector']).toBe('edge.color-index-3');
  expect(stylesheet[4]['selector']).toBe('edge.color-index-null');
});
