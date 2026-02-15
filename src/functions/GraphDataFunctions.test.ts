import { NodePosition } from '../components/NodePosition';
import {
  convertElementDataToString,
  convertElementDataToStringForEdgeType,
  convertNodePositionDataToString,
  parseAnswerData,
  parseGraphData,
  parseNodePositionData,
} from './GraphDataFunctions';

/**
 * グラフ データを文字列に変換する関数のテストです。
 */
test('convertElementDataToString', () => {
  const elementData = [
    {
      data: {
        id: '1',
        type: 'node',
        isstart: false,
        istarget: false,
      },
    },
    {
      data: {
        id: '2',
        type: 'node',
        isstart: false,
        istarget: false,
      },
    },
    {
      data: {
        id: '1-2',
        type: 'edge',
        edgeId: '1',
        isstart: false,
        istarget: false,
        source: '1',
        target: '2',
      },
    },
  ];
  // グラフ データを文字列に変換します。
  const [graphDataStr, stDataStr] = convertElementDataToString(
    elementData,
    null,
  );

  // 結果を確認します。
  expect(graphDataStr).toBe(
    `p 2 1
e 1 2
`,
  );
  expect(stDataStr).toBe('');
});

/**
 * グラフ データを文字列に変換する関数のテストです。
 * 開始、目標データが存在する場合です。
 */
test('convertElementDataToStringWhenStDataExist', () => {
  const elementData = [
    {
      data: {
        id: '1',
        type: 'node',
        isstart: true,
        istarget: false,
      },
    },
    {
      data: {
        id: '2',
        type: 'node',
        isstart: false,
        istarget: true,
      },
    },
    {
      data: {
        id: '1-2',
        type: 'edge',
        edgeId: '1',
        isstart: false,
        istarget: false,
        source: '1',
        target: '2',
      },
    },
  ];
  // グラフ データを文字列に変換します。
  const [graphDataStr, stDataStr] = convertElementDataToString(
    elementData,
    null,
  );

  // 結果を確認します。
  expect(graphDataStr).toBe(
    `p 2 1
e 1 2
`,
  );
  expect(stDataStr).toBe(
    `s 1
t 2
`,
  );
});

/**
 * グラフ データを文字列に変換する関数のテストです。
 * ノード位置データが存在する場合です。
 */
test('convertElementDataToStringWhenNodePositionDataExist', () => {
  const elementData = [
    {
      data: {
        id: '1',
        type: 'node',
        isstart: false,
        istarget: false,
      },
    },
    {
      data: {
        id: '2',
        type: 'node',
        isstart: false,
        istarget: false,
      },
    },
    {
      data: {
        id: '1-2',
        type: 'edge',
        edgeId: '1',
        isstart: false,
        istarget: false,
        source: '1',
        target: '2',
      },
    },
  ];
  const nodePositions: NodePosition[] = [
    {
      id: '1',
      x: 100,
      y: 10,
      isStart: false,
      isTarget: false,
      isSelected: false,
    },
    {
      id: '2',
      x: 20,
      y: 200,
      isStart: false,
      isTarget: false,
      isSelected: false,
    },
  ];
  // グラフ データを文字列に変換します。
  const [graphDataStr] = convertElementDataToString(elementData, nodePositions);

  // 結果を確認します。
  expect(graphDataStr).toBe(
    `p 2 1
e 1 2
c p 1 100 10
c p 2 20 200
`,
  );
});

/**
 * グラフ データを文字列に変換する関数 (辺タイプ用) のテストです。
 */
test('convertElementDataToStringForEdgeType', () => {
  const elementData = [
    {
      data: {
        id: '1',
        type: 'node',
        isstart: false,
        istarget: false,
      },
    },
    {
      data: {
        id: '2',
        type: 'node',
        isstart: false,
        istarget: false,
      },
    },
    {
      data: {
        id: '1-2',
        type: 'edge',
        edgeId: '1',
        isstart: false,
        istarget: false,
        source: '1',
        target: '2',
      },
    },
  ];
  // グラフ データを文字列に変換します。
  const [graphDataStr, stDataStr] = convertElementDataToStringForEdgeType(
    elementData,
    null,
  );

  // 結果を確認します。
  expect(graphDataStr).toBe(
    `p 2 1
e 1 2
`,
  );
  expect(stDataStr).toBe('');
});

/**
 * グラフ データを文字列に変換する関数 (辺タイプ用) のテストです。
 * 開始、目標データが存在する場合です。
 */
test('convertElementDataToStringForEdgeTypeWhenStDataExist', () => {
  const elementData = [
    {
      data: {
        id: '1',
        type: 'node',
        isstart: false,
        istarget: false,
      },
    },
    {
      data: {
        id: '2',
        type: 'node',
        isstart: false,
        istarget: false,
      },
    },
    {
      data: {
        id: '3',
        type: 'node',
        isstart: false,
        istarget: false,
      },
    },
    {
      data: {
        id: '1-2',
        type: 'edge',
        edgeId: '1',
        isstart: true,
        istarget: false,
        source: '1',
        target: '2',
      },
    },
    {
      data: {
        id: '2-3',
        type: 'edge',
        edgeId: '2',
        isstart: false,
        istarget: true,
        source: '2',
        target: '3',
      },
    },
  ];
  // グラフ データを文字列に変換します。
  const [graphDataStr, stDataStr] = convertElementDataToStringForEdgeType(
    elementData,
    null,
  );

  // 結果を確認します。
  expect(graphDataStr).toBe(
    `p 3 2
e 1 2
e 2 3
`,
  );
  expect(stDataStr).toBe(
    `s 1
t 2
`,
  );
});

/**
 * グラフ データを文字列に変換する関数 (辺タイプ用) のテストです。
 * ノード位置データが存在する場合です。
 */
test('convertElementDataToStringForEdgeTypeWhenNodePositionDataExist', () => {
  const elementData = [
    {
      data: {
        id: '1',
        type: 'node',
        isstart: false,
        istarget: false,
      },
    },
    {
      data: {
        id: '2',
        type: 'node',
        isstart: false,
        istarget: false,
      },
    },
    {
      data: {
        id: '1-2',
        type: 'edge',
        edgeId: '1',
        isstart: false,
        istarget: false,
        source: '1',
        target: '2',
      },
    },
  ];
  const nodePositions: NodePosition[] = [
    {
      id: '1',
      x: 100,
      y: 10,
      isStart: false,
      isTarget: false,
      isSelected: false,
    },
    {
      id: '2',
      x: 20,
      y: 200,
      isStart: false,
      isTarget: false,
      isSelected: false,
    },
  ];
  // グラフ データを文字列に変換します。
  const [graphDataStr] = convertElementDataToStringForEdgeType(
    elementData,
    nodePositions,
  );

  // 結果を確認します。
  expect(graphDataStr).toBe(
    `p 2 1
e 1 2
c p 1 100 10
c p 2 20 200
`,
  );
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 */
test('parseGraphData', () => {
  // 入力文字列を作成します。
  const inputStr = `
  p 2 1
  e 1 2
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'vertex');

  // 変換結果を確認します。
  expect(dataType).toBe('graphdata');
  expect(elements.length).toBe(3);
  expect(elements[0].data.id).toBe('1');
  expect(elements[1].data.id).toBe('2');
  expect(elements[2].data.edgeId).toBe('1');
  expect(elements[2].data.source).toBe('1');
  expect(elements[2].data.target).toBe('2');
  expect(numColors).toBe(-1);
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 * ノードの位置データが含まれる場合です。
 */
test('parseGraphDataWhenNodePosisionsExist', () => {
  // 入力文字列を作成します。
  const inputStr = `
  p 2 1
  e 1 2
  c p 1 10 100
  c p 2 200 20
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'vertex');

  // 変換結果を確認します。
  expect(dataType).toBe('graphdata');
  expect(elements.length).toBe(3);
  expect(elements[0].data.id).toBe('1');
  expect(elements[1].data.id).toBe('2');
  expect(elements[2].data.edgeId).toBe('1');
  expect(elements[2].data.source).toBe('1');
  expect(elements[2].data.target).toBe('2');
  expect(nodePositions.length).toBe(2);
  expect(nodePositions[0].id).toBe('1');
  expect(nodePositions[0].x).toBe(10);
  expect(nodePositions[0].y).toBe(100);
  expect(nodePositions[1].id).toBe('2');
  expect(nodePositions[1].x).toBe(200);
  expect(nodePositions[1].y).toBe(20);
  expect(numColors).toBe(-1);
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 * 開始、目標データのみが含まれる場合です。
 */
test('parseGraphDataForVertexTypeWhenStDataExist', () => {
  // 入力文字列を作成します。
  const inputStr = `
  s 2
  t 1
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'vertex');

  // 変換結果を確認します。
  expect(dataType).toBe('stdata');
  expect(starts.length).toBe(1);
  expect(starts[0]).toBe('2');
  expect(targets.length).toBe(1);
  expect(targets[0]).toBe('1');
  expect(numColors).toBe(-1);
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 * 頂点タイプの場合で、開始、目標データが含まれる場合です。
 */
test('parseGraphDataForVertexTypeWhenStDataExist', () => {
  // 入力文字列を作成します。
  const inputStr = `
  p 2 1
  e 1 2
  s 2
  t 1
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'vertex');

  // 変換結果を確認します。
  expect(dataType).toBe('wholedata');
  expect(elements.length).toBe(3);
  expect(elements[0].data.id).toBe('1');
  expect(elements[0].data.isstart).toBeFalsy();
  expect(elements[0].data.istarget).toBeTruthy();
  expect(elements[1].data.id).toBe('2');
  expect(elements[1].data.isstart).toBeTruthy();
  expect(elements[1].data.istarget).toBeFalsy();
  expect(elements[2].data.edgeId).toBe('1');
  expect(elements[2].data.source).toBe('1');
  expect(elements[2].data.target).toBe('2');

  expect(starts.length).toBe(1);
  expect(starts[0]).toBe('2');
  expect(targets.length).toBe(1);
  expect(targets[0]).toBe('1');
  expect(numColors).toBe(-1);
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 * 辺タイプの場合で、開始、目標データが含まれる場合です。
 */
test('parseGraphDataForEdgeTypeWhenStDataExist', () => {
  // 入力文字列を作成します。
  const inputStr = `
  p 3 2
  e 1 2
  e 2 3
  s 2
  t 1
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'edge');

  // 変換結果を確認します。
  expect(dataType).toBe('wholedata');
  expect(elements.length).toBe(5);
  expect(elements[3].data.edgeId).toBe('1');
  expect(elements[3].data.isstart).toBeFalsy();
  expect(elements[3].data.istarget).toBeTruthy();
  expect(elements[4].data.edgeId).toBe('2');
  expect(elements[4].data.isstart).toBeTruthy();
  expect(elements[4].data.istarget).toBeFalsy();
  expect(starts.length).toBe(1);
  expect(starts[0]).toBe('2');
  expect(targets.length).toBe(1);
  expect(targets[0]).toBe('1');
  expect(numColors).toBe(-1);
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 * 頂点タイプの場合で、開始、目標データが含まれる場合です。
 */
test('parseGraphDataForVertexTypeWhenStDataExist', () => {
  // 入力文字列を作成します。
  const inputStr = `
  p 2 1
  e 1 2
  s 2
  t 1
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'vertex');

  // 変換結果を確認します。
  expect(dataType).toBe('wholedata');
  expect(elements.length).toBe(3);
  expect(elements[0].data.id).toBe('1');
  expect(elements[0].data.isstart).toBeFalsy();
  expect(elements[0].data.istarget).toBeTruthy();
  expect(elements[1].data.id).toBe('2');
  expect(elements[1].data.isstart).toBeTruthy();
  expect(elements[1].data.istarget).toBeFalsy();
  expect(elements[2].data.edgeId).toBe('1');
  expect(elements[2].data.source).toBe('1');
  expect(elements[2].data.target).toBe('2');

  expect(starts.length).toBe(1);
  expect(starts[0]).toBe('2');
  expect(targets.length).toBe(1);
  expect(targets[0]).toBe('1');
  expect(numColors).toBe(-1);
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 * 頂点彩色タイプの場合です。
 */
test('parseGraphDataForVColorType', () => {
  // 入力文字列を作成します。
  const inputStr = `
  p 2 1
  e 1 2
  s 9 5
  t 7 1
  x COLOR 10
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'vcolor');

  // 変換結果を確認します。
  expect(dataType).toBe('wholedata');
  expect(elements.length).toBe(3);
  expect(elements[0].data.id).toBe('1');
  expect(elements[0].data.isstart).toBeFalsy();
  expect(elements[0].data.istarget).toBeFalsy();
  expect(elements[0].data.startcolorindex).toBe(9);
  expect(elements[0].data.targetcolorindex).toBe(7);
  expect(elements[1].data.id).toBe('2');
  expect(elements[1].data.isstart).toBeFalsy();
  expect(elements[1].data.istarget).toBeFalsy();
  expect(elements[1].data.startcolorindex).toBe(5);
  expect(elements[1].data.targetcolorindex).toBe(1);
  expect(elements[2].data.edgeId).toBe('1');
  expect(elements[2].data.source).toBe('1');
  expect(elements[2].data.target).toBe('2');
  expect(starts.length).toBe(2);
  expect(starts[0]).toBe('9');
  expect(starts[1]).toBe('5');
  expect(targets.length).toBe(2);
  expect(targets[0]).toBe('7');
  expect(targets[1]).toBe('1');
  expect(numColors).toBe(10);
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 * ノード数、エッジ数を表す行が不正な場合です。
 */
test('parseGraphDataWhenNumNodeEdgeLineIsInvalid', () => {
  // 入力文字列を作成します。
  const inputStr = `
  p 3
  e 1 2
  e 2 3
  s 2
  t 1
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'edge');

  // 変換結果を確認します。
  expect(error.length).toBe(2);
  expect(error[0]).toBe('ノード数とエッジ数を表す行の列数が不正です。');
  expect(error[1]).toBe('* 行番号 : 1');
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 * ノード位置を表す行が不正な場合です。
 */
test('parseGraphDataWhenNodePositionLineIsInvalid', () => {
  // 入力文字列を作成します。
  const inputStr = `
  p 3 5
  e 1 2
  e 2 3
  c p 10
  s 2
  t 1
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'edge');

  // 変換結果を確認します。
  expect(error.length).toBe(2);
  expect(error[0]).toBe('ノード位置を表す行の列数が不正です。');
  expect(error[1]).toBe('* 行番号 : 4');
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 * エッジを表す行が不正な場合です。
 */
test('parseGraphDataWhenEdgeLineIsInvalid', () => {
  // 入力文字列を作成します。
  const inputStr = `
  p 3 5
  e 1 2
  e 2
  c p 10
  s 2
  t 1
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'edge');

  // 変換結果を確認します。
  expect(error.length).toBe(2);
  expect(error[0]).toBe('エッジを表す行の列数が不正です。');
  expect(error[1]).toBe('* 行番号 : 3');
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 * 行とのキーが不正な場合です。
 */
test('parseGraphDataWhenKeyIsInvalid', () => {
  // 入力文字列を作成します。
  const inputStr = `
  p 3 5
  e 1 2
  q 2 3
  c p 10
  s 2
  t 1
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'edge');

  // 変換結果を確認します。
  expect(error.length).toBe(2);
  expect(error[0]).toBe('キー文字が不正です。');
  expect(error[1]).toBe('* 行番号 : 3');
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 * 色数が不正な場合です。
 */
test('parseGraphDataWhenColorNumberLineIsInvalid', () => {
  // 入力文字列を作成します。
  const inputStr = `
  p 2 1
  e 1 2
  s 1 1
  t 1 1
  x COLOR -1
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'vcolor');

  // 変換結果を確認します。
  expect(error[0]).toBe('色数を表す行の値が不正です。');
  expect(error[1]).toBe('* 行番号 : 5');
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 * 開始色インデックスが不正な場合 (1) です。
 */
test('parseGraphDataWhenStartColorIndexIsInvalid1', () => {
  // 入力文字列を作成します。
  const inputStr = `
  p 2 1
  e 1 2
  s 1 a
  t 1 1
  x COLOR 2
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'vcolor');

  // 変換結果を確認します。
  expect(error[0]).toBe('頂点 2 の開始色インデックスが不正です。');
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 * 開始色インデックスが不正な場合 (2) です。
 */
test('parseGraphDataWhenStartColorIndexIsInvalid2', () => {
  // 入力文字列を作成します。
  const inputStr = `
  p 2 1
  e 1 2
  s 1 3
  t 1 1
  x COLOR 2
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'vcolor');

  // 変換結果を確認します。
  expect(error[0]).toBe('頂点 2 の開始色インデックスが不正です。');
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 * 目標色インデックスが不正な場合 (1) です。
 */
test('parseGraphDataWhenTargetColorIndexIsInvalid1', () => {
  // 入力文字列を作成します。
  const inputStr = `
  p 2 1
  e 1 2
  s 1 1
  t a 1
  x COLOR 2
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'vcolor');

  // 変換結果を確認します。
  expect(error[0]).toBe('頂点 1 の目標色インデックスが不正です。');
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 * 目標色インデックスが不正な場合 (2) です。
 */
test('parseGraphDataWhenTargetColorIndexIsInvalid2', () => {
  // 入力文字列を作成します。
  const inputStr = `
  p 2 1
  e 1 2
  s 1 1
  t 3 1
  x COLOR 2
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'vcolor');

  // 変換結果を確認します。
  expect(error[0]).toBe('頂点 1 の目標色インデックスが不正です。');
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 * 開始色インデックス行が複数回指定されている場合です。
 */
test('parseGraphDataWhenMultipleStartColorIndexLinesExist', () => {
  // 入力文字列を作成します。
  const inputStr = `
  p 2 1
  e 1 2
  s 1 3
  t 1 1
  x COLOR 2
  s 1 3
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'vcolor');

  // 変換結果を確認します。
  expect(error[0]).toBe('開始色集合が複数回指定されています。');
  expect(error[1]).toBe('* 行番号 : 6');
});

/**
 * グラフ データを表す文字列をパースする関数のテストです。
 * 目標色インデックス行が複数回指定されている場合です。
 */
test('parseGraphDataWhenMultipleTargetColorIndexLinesExist', () => {
  // 入力文字列を作成します。
  const inputStr = `
  p 2 1
  e 1 2
  s 1 3
  t 1 1
  x COLOR 2
  t 1 1
`;
  // 文字列をグラフ データに変換します。
  const [elements, error, starts, targets, numColors, nodePositions, dataType] =
    parseGraphData(inputStr, 'vcolor');

  // 変換結果を確認します。
  expect(error[0]).toBe('目標色集合が複数回指定されています。');
  expect(error[1]).toBe('* 行番号 : 6');
});

/**
 * 解答を表す文字列をパースする関数のテストです。
 * 成功データが与えられた場合です。
 */
test('parseAnswerDataWhenSuccessDataIsGiven', () => {
  // 入力文字列を作成します。
  const inputStr = `
  a YES
  a 1 2 3
  a 4 5 6
`;
  // 文字列をグラフ データに変換します。
  const [answerData, succeeded] = parseAnswerData(inputStr);

  // 変換結果を確認します。
  expect(succeeded).toBeTruthy();
  expect(answerData.length).toBe(2);
  expect(answerData[0]).toStrictEqual(['1', '2', '3']);
  expect(answerData[1]).toStrictEqual(['4', '5', '6']);
});

/**
 * 解答を表す文字列をパースする関数のテストです。
 * 失敗データが与えられた場合です。
 */
test('parseAnswerDataWhenFailureDataIsGiven', () => {
  // 入力文字列を作成します。
  const inputStr = `
  a NO
  a 1 2 3
  a 4 5 6
`;
  // 文字列をグラフ データに変換します。
  const [answerData, succeeded] = parseAnswerData(inputStr);

  // 変換結果を確認します。
  expect(succeeded).toBeFalsy();
});

/**
 * ノードの位置データを文字列に変換する関数のテストです。
 */
test('convertNodePositionDataToString', () => {
  // 入力となるノードの位置データを作成します。
  const nodePositions: NodePosition[] = [
    {
      id: '1',
      x: 100,
      y: 10,
      isStart: false,
      isTarget: true,
      isSelected: false,
    },
    {
      id: '2',
      x: 20,
      y: 200,
      isStart: true,
      isTarget: false,
      isSelected: false,
    },
  ];
  // 文字列をノードの位置データに変換します。
  const nodePositionsStr = convertNodePositionDataToString(nodePositions);

  // 変換結果を確認します。
  expect(nodePositionsStr).toBe(
    `1 100 10 false true
2 20 200 true false
`,
  );
});

/**
 * ノードの位置データを表す文字列をパースします。
 */
test('parseNodePositionData', () => {
  // 入力文字列を作成します。
  const inputStr = `
  1 100 10 false true
2 20 200 true false
`;
  // 文字列を位置データに変換します。
  const nodePositions = parseNodePositionData(inputStr);

  // 変換結果を確認します。
  expect(nodePositions.length).toBe(2);
  expect(nodePositions[0].id).toBe('1');
  expect(nodePositions[0].x).toBe(100);
  expect(nodePositions[0].y).toBe(10);
  expect(nodePositions[0].isStart).toBeFalsy();
  expect(nodePositions[0].isTarget).toBeTruthy();
  expect(nodePositions[1].id).toBe('2');
  expect(nodePositions[1].x).toBe(20);
  expect(nodePositions[1].y).toBe(200);
  expect(nodePositions[1].isStart).toBeTruthy();
  expect(nodePositions[1].isTarget).toBeFalsy();
});
