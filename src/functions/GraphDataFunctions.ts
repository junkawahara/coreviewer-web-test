import { ElementDefinition } from 'cytoscape';

import { compareElements, getEdgeData } from './UtilFunctions';
import { NodePosition } from '../components/NodePosition';
import { AnswerData } from '../components/AnswerData';

/**
 * グラフのデータを文字列に変換します。
 * @param {ElementDefinition[]} elements グラフのデータ
 * @param {NodePosition[] | null} nodePositions ノードの位置データ
 * @param {number} numColors 色数。彩色タイプの場合のみ指定される。
 * @return {string[]} グラフのデータを表す文字列
 */
export function convertElementDataToString(
  elements: ElementDefinition[],
  nodePositions: NodePosition[] | null = null,
  numColors = -1,
): string[] {
  const nodes: string[] = [];
  const starts: string[] = [];
  const targets: string[] = [];
  const edgeDataList: string[] = [];

  // 対象となるグラフ データを ID 順にソートします。
  const targetElements = [...elements];
  targetElements.sort(compareElements);

  // グラフのデータを走査し、表示に必要となるデータを収集します。
  for (
    let elementIndex = 0;
    elementIndex < targetElements.length;
    elementIndex++
  ) {
    const elem = targetElements[elementIndex];

    if (elem.data.type === 'node') {
      // ノードのデータを追加します。
      if (elem.data.id && !nodes.includes(elem.data.id)) {
        nodes.push(elem.data.id);
      }
      // 開始、目標データを設定します。
      if (elem.data.id) {
        if (numColors > 0) {
          const elemId = parseInt(elem.data.id);
          for (let index = starts.length + 1; index <= elemId; index++) {
            starts.push('-1');
            targets.push('-1');
          }
          starts[elemId - 1] = elem.data.startcolorindex.toString();
          targets[elemId - 1] = elem.data.targetcolorindex.toString();
        } else {
          if (elem.data.isstart && !starts.includes(elem.data.id)) {
            starts.push(elem.data.id);
          }
          if (elem.data.istarget && !targets.includes(elem.data.id)) {
            targets.push(elem.data.id);
          }
        }
      }
    }
    if (elem.data.type === 'edge') {
      const source = elem.data.source;
      const target = elem.data.target;
      // エッジの両端のノードのデータを追加します。
      if (!nodes.includes(source)) {
        nodes.push(source);
      }
      if (!nodes.includes(target)) {
        nodes.push(target);
      }
      // エッジのデータを追加します。
      edgeDataList.push(`e ${source} ${target}`);
    }
  }
  // 収集したデータをもとに文字列を作成します。
  let graphData = '';
  if (nodes.length !== 0) {
    graphData = `p ${nodes.length} ${edgeDataList.length}\n`;
  }
  if (edgeDataList.length !== 0) {
    // エッジを表す文字列を作成します。
    graphData += edgeDataList.join('\n') + '\n';
  }

  // ノード位置データが与えられている場合は
  // 対応する文字列を作成します。
  if (nodePositions) {
    nodePositions.forEach(n => {
      graphData += `c p ${n.id} ${Math.round(Number(n.x))} ${Math.round(
        Number(n.y),
      )}\n`;
    });
  }

  let stData = '';
  if (starts.length !== 0) {
    // 開始独立集合を表す文字列を作成します。
    stData += 's ' + starts.join(' ') + '\n';
  }
  if (targets.length !== 0) {
    // 目標独立集合を表す文字列を作成します。
    stData += 't ' + targets.join(' ') + '\n';
  }
  // 彩色タイプの場合は色数を表す文字列を追加します。
  if (numColors > 0) {
    stData += 'x COLOR ' + numColors.toString() + '\n';
  }
  return [graphData, stData];
}

/**
 * グラフのデータを文字列に変換します。
 * 辺タイプ用の関数です。
 * @param {ElementDefinition[]} elements グラフのデータ
 * @param {NodePosition[] | null} nodePositions ノードの位置データ
 * @param {number} numColors 色数。彩色タイプの場合のみ指定される。
 * @return {string[]} グラフのデータを表す文字列
 */
export function convertElementDataToStringForEdgeType(
  elements: ElementDefinition[],
  nodePositions: NodePosition[] | null = null,
  numColors = -1,
): string[] {
  const nodes: string[] = [];
  const starts: string[] = [];
  const targets: string[] = [];
  const edgeDataList: string[] = [];

  // 対象となるグラフ データを ID 順にソートします。
  const targetElements = [...elements];
  targetElements.sort(compareElements);

  // グラフのデータを走査し、表示に必要となるデータを収集します。
  for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
    const elem = targetElements[elementIndex];

    if (elem.data.type === 'node') {
      // ノードのデータを追加します。
      if (elem.data.id && !nodes.includes(elem.data.id)) {
        nodes.push(elem.data.id);
      }
    }
    if (elem.data.type === 'edge') {
      const source = elem.data.source;
      const target = elem.data.target;
      // エッジの両端のノードのデータを追加します。
      if (!nodes.includes(source)) {
        nodes.push(source);
      }
      if (!nodes.includes(target)) {
        nodes.push(target);
      }
      // エッジのデータを追加します。
      edgeDataList.push(`e ${source} ${target}`);

      if (numColors > 0) {
        const elemId = parseInt(elem.data.edgeId);
        for (let index = starts.length + 1; index <= elemId; index++) {
          starts.push('-1');
          targets.push('-1');
        }
        starts[elemId - 1] = elem.data.startcolorindex.toString();
        targets[elemId - 1] = elem.data.targetcolorindex.toString();
      } else {
        // 開始独立集合状態フラグが true の場合は、開始独立集合状態リストに追加します。
        if (
          elem.data.edgeId &&
          elem.data.isstart &&
          !starts.includes(elem.data.edgeId)
        ) {
          starts.push(elem.data.edgeId);
        }
        // 目標独立集合状態フラグが true の場合は、目標独立集合状態リストに追加します。
        if (
          elem.data.edgeId &&
          elem.data.istarget &&
          !targets.includes(elem.data.edgeId)
        ) {
          targets.push(elem.data.edgeId);
        }
      }
    }
  }
  // 収集したデータをもとに、表示する文字列を作成します。
  let graphData = '';
  if (nodes.length !== 0) {
    graphData = `p ${nodes.length} ${edgeDataList.length}\n`;
  }
  if (edgeDataList.length !== 0) {
    // エッジを表す文字列を作成します。
    graphData += edgeDataList.join('\n') + '\n';
  }

  // ノード位置データが与えられている場合は
  // 対応する文字列を作成します。
  if (nodePositions) {
    nodePositions.forEach(n => {
      graphData += `c p ${n.id} ${Math.round(Number(n.x))} ${Math.round(
        Number(n.y),
      )}\n`;
    });
  }

  let stData = '';
  if (starts.length !== 0) {
    // 開始独立集合を表す文字列を作成します。
    stData += 's ' + starts.join(' ') + '\n';
  }
  if (targets.length !== 0) {
    // 目標独立集合を表す文字列を作成します。
    stData += 't ' + targets.join(' ') + '\n';
  }
  // 彩色タイプの場合は色数を表す文字列を追加します。
  if (numColors > 0) {
    stData += 'x COLOR ' + numColors.toString() + '\n';
  }
  return [graphData, stData];
}
/**
 * エラー発生時用のデータ一式を取得します。
 * @param {string} errorMessage エラー メッセージ
 * @param {number} lineCount エラーが生じた行番号
 * @return {[ElementDefinition[], string, string[], string[],  number, NodePosition[], string]}
 * 読み込んだデータ、エラー メッセージ、開始データ、目標データ、色数、ノード位置データ、およびデータの種類です。
 */
function getErrorData(
  errorMessage: string,
  lineCount: number,
): [
  elements: ElementDefinition[],
  error: string[],
  starts: string[],
  targets: string[],
  numColors: number,
  nodePositions: NodePosition[],
  dataType: string,
] {
  if (lineCount >= 0) {
    return [[], [errorMessage, `* 行番号 : ${lineCount}`], [], [], 0, [], ''];
  } else {
    return [[], [errorMessage], [], [], 0, [], ''];
  }
}

/**
 * 文字列をパースしてグラフの要素データを取得します。
 * @param {string} str パースの対象とな類文字列
 * @param {string} problemType 問題タイプ
 * @return {[ElementDefinition[], string, string[], string[],  number, NodePosition[], string]}
 * 読み込んだデータ、エラー メッセージ、開始データ、目標データ、色数、ノード位置データ、およびデータの種類です。
 */
export function parseGraphData(
  str: string,
  problemType: string,
): [
  elements: ElementDefinition[],
  error: string[],
  starts: string[],
  targets: string[],
  numColors: number,
  nodePositions: NodePosition[],
  dataType: string,
] {
  const lines = str.trim().split(/\r\n|\n/);
  const nodeElements: ElementDefinition[] = [];
  const edgeElements: ElementDefinition[] = [];
  const nodes: string[] = [];
  const starts: string[] = [];
  const targets: string[] = [];
  let numColors = -1;
  const nodePositions: NodePosition[] = [];
  let dataType = 'none';
  let containsGraphData = false;
  let containsStData = false;

  // 各行を走査し、グラフの要素データを作成します。
  let lineCount = 0;
  let edgeId = 1;
  for (const line of lines) {
    lineCount++;
    const arr = line.trim().split(/\s+/);
    // 列数が 0 の行は無視します。
    if (arr.length === 0 || arr[0] === '') {
      continue;
    }
    // p で始まる行の場合です。
    if (arr[0] === 'p') {
      if (arr.length < 3) {
        return getErrorData(
          'ノード数とエッジ数を表す行の列数が不正です。',
          lineCount,
        );
      } else {
        const numNodes = parseInt(arr[1]);
        for (let nodeIndex = 1; nodeIndex <= numNodes; nodeIndex++) {
          nodes.push(`${nodeIndex}`);
          nodeElements.push({
            data: {
              id: `${nodeIndex}`,
              label: `Node${nodeIndex}`,
              type: 'node',
              isstart: false,
              istarget: false,
              startcolorindex: -1,
              targetcolorindex: -1,
            },
          });
        }
      }
      continue;
    }
    // c で始まる行の場合です。
    if (arr[0] === 'c') {
      // 2 文字目が p の場合です。
      if (arr.length >= 2 && arr[1] === 'p') {
        // ノード位置を表す行の列数が足りない場合です。
        if (arr.length < 5) {
          return getErrorData(
            'ノード位置を表す行の列数が不正です。',
            lineCount,
          );
        } else {
          // ノード位置を読み込みます。
          nodePositions.push({
            id: arr[2],
            x: Number(arr[3]),
            y: Number(arr[4]),
            isSelected: false,
            isStart: false,
            isTarget: false,
          });

          continue;
        }
        // 2 文字目が p 以外の場合です。
      } else {
        continue;
      }
      // e で始まる行から、ノード、およびエッジのデータを読み込みます。
    } else if (arr[0] === 'e') {
      if (arr.length < 3) {
        return getErrorData('エッジを表す行の列数が不正です。', lineCount);
      }
      containsGraphData = true;
      const source = arr[1];
      const target = arr[2];
      // エッジのソース ノードのデータを作成します。
      if (!nodes.includes(source)) {
        nodes.push(source);
        nodeElements.push({
          data: {
            id: source,
            label: `Node${source}`,
            type: 'node',
            isstart: false,
            istarget: false,
            startcolorindex: -1,
            targetcolorindex: -1,
          },
        });
      }
      // エッジのターゲット ノードのデータを作成します。
      if (!nodes.includes(target)) {
        nodes.push(target);
        nodeElements.push({
          data: {
            id: target,
            label: `Node${target}`,
            type: 'node',
            isstart: false,
            istarget: false,
            startcolorindex: -1,
            targetcolorindex: -1,
          },
        });
      }
      // エッジのデータを作成します。
      const newEdgeData = getEdgeData(source, target, edgeId);
      edgeElements.push(newEdgeData);

      edgeId++;
      // s で始まる行から、開始位置データを読み込みます。
    } else if (arr[0] === 's') {
      containsStData = true;
      // 問題が彩色タイプの場合で既に開始集合が指定されている場合はエラーとします。
      if (
        (problemType === 'vcolor' || problemType === 'ecolor') &&
        starts.length > 0
      ) {
        return getErrorData('開始色集合が複数回指定されています。', lineCount);
      }
      for (let col = 1; col < arr.length; col++) {
        starts.push(arr[col]);
      }
      // t で始まる行から、終了位置データを読み込みます。
    } else if (arr[0] === 't') {
      containsStData = true;
      // 問題が頂点彩色タイプの場合で既に目標集合が指定されている場合はエラーとします。
      if (
        (problemType === 'vcolor' || problemType === 'ecolor') &&
        targets.length > 0
      ) {
        return getErrorData('目標色集合が複数回指定されています。', lineCount);
      }
      for (let col = 1; col < arr.length; col++) {
        targets.push(arr[col]);
      }
      // x で始まる行から、色数を読み込みます。
    } else if (arr[0] === 'x') {
      if (problemType !== 'vcolor' && problemType !== 'ecolor') {
        return getErrorData('キー文字が不正です。', lineCount);
      }
      if (arr.length < 3) {
        return getErrorData('色数を表す行の列数が不正です。', lineCount);
      }

      if (arr[1] !== 'COLOR') {
        return getErrorData(
          '色数を表す行に "COLOR" キーワードが指定されていません。',
          lineCount,
        );
      }

      containsStData = true;
      numColors = parseInt(arr[2]);
      if (Number.isNaN(numColors) || numColors < 0) {
        return getErrorData('色数を表す行の値が不正です。', lineCount);
      }
    } else {
      return getErrorData('キー文字が不正です。', lineCount);
    }
  }

  // 問題が彩色タイプの場合は色数が指定されているかどうかをチェックします。
  if (
    (problemType === 'vcolor' || problemType === 'ecolor') &&
    containsStData
  ) {
    if (numColors === -1) {
      return getErrorData('彩色タイプの色数が指定されていません。', lineCount);
    }
  }

  // 作成したノード データに開始位置フラグを設定します。
  for (let startIndex = 0; startIndex < starts.length; startIndex++) {
    switch (problemType) {
      case 'vertex':
        const startNode = nodeElements.find(
          nodeElem => nodeElem.data.id === starts[startIndex],
        );
        if (startNode) {
          startNode.data.isstart = true;
        }
        break;
      case 'edge':
        const startEdge = edgeElements.find(
          edgeElem => edgeElem.data.edgeId === starts[startIndex],
        );
        if (startEdge) {
          startEdge.data.isstart = true;
        }
        break;
      case 'vcolor':
        const startColoredNode = nodeElements.find(
          nodeElem => nodeElem.data.id === (startIndex + 1).toString(),
        );
        if (startColoredNode) {
          const colorIndex = parseInt(starts[startIndex]);
          // 開始色インデックスが不正な場合はエラーとします。
          if (Number.isNaN(colorIndex) || colorIndex > numColors) {
            return getErrorData(
              `頂点 ${startIndex + 1} の開始色インデックスが不正です。`,
              -1,
            );
          }
          startColoredNode.data.startcolorindex =
            colorIndex > 0 ? colorIndex : -1;
        }
        break;
      case 'ecolor':
        const startColoredEdge = edgeElements.find(
          edgeElem => edgeElem.data.edgeId === (startIndex + 1).toString(),
        );
        if (startColoredEdge) {
          const colorIndex = parseInt(starts[startIndex]);
          // 開始色インデックスが不正な場合はエラーとします。
          if (Number.isNaN(colorIndex) || colorIndex > numColors) {
            return getErrorData(
              `頂点 ${startIndex + 1} の開始色インデックスが不正です。`,
              -1,
            );
          }
          startColoredEdge.data.startcolorindex =
            colorIndex > 0 ? colorIndex : -1;
        }
        break;
    }
  }
  // 作成したノード データに目標位置フラグを設定します。
  for (let targetIndex = 0; targetIndex < targets.length; targetIndex++) {
    switch (problemType) {
      case 'vertex':
        const targetNode = nodeElements.find(
          nodeElem => nodeElem.data.id === targets[targetIndex],
        );
        if (targetNode) {
          targetNode.data.istarget = true;
        }
        break;
      case 'edge':
        const targetEdge = edgeElements.find(
          edgeElem => edgeElem.data.edgeId === targets[targetIndex],
        );
        if (targetEdge) {
          targetEdge.data.istarget = true;
        }
        break;
      case 'vcolor':
        const targetColoredNode = nodeElements.find(
          nodeElem => nodeElem.data.id === (targetIndex + 1).toString(),
        );
        if (targetColoredNode) {
          const colorIndex = parseInt(targets[targetIndex]);
          // 目標色インデックスが不正な場合はエラーとします。
          if (Number.isNaN(colorIndex) || colorIndex > numColors) {
            return getErrorData(
              `頂点 ${targetIndex + 1} の目標色インデックスが不正です。`,
              -1,
            );
          }
          targetColoredNode.data.targetcolorindex =
            colorIndex > 0 ? colorIndex : -1;
        }
        break;
      case 'ecolor':
        const targetColoredEdge = edgeElements.find(
          edgeElem => edgeElem.data.edgeId === (targetIndex + 1).toString(),
        );
        if (targetColoredEdge) {
          const colorIndex = parseInt(targets[targetIndex]);
          // 目標色インデックスが不正な場合はエラーとします。
          if (Number.isNaN(colorIndex) || colorIndex > numColors) {
            return getErrorData(
              `頂点 ${targetIndex + 1} の目標色インデックスが不正です。`,
              -1,
            );
          }
          targetColoredEdge.data.targetcolorindex =
            colorIndex > 0 ? colorIndex : -1;
        }
        break;
    }
  }
  // データの種類を取得します。
  if (containsGraphData && containsStData) {
    dataType = 'wholedata';
  } else if (containsGraphData) {
    dataType = 'graphdata';
  } else if (containsStData) {
    dataType = 'stdata';
  }
  return [
    nodeElements.concat(edgeElements),
    [],
    starts,
    targets,
    numColors,
    nodePositions,
    dataType,
  ];
}

/**
 * 解答を表す文字列をパースして解答データを取得します。
 * @param {string} answerStr パースの対象となる文字列
 * @return {[AnswerData, boolean]} 解答データ
 */
export function parseAnswerData(
  answerStr: string,
): [answerData: AnswerData, succeeded: boolean] {
  const lines = answerStr.trim().split(/\r\n|\n/);
  let succeeded = true;
  const answerData: AnswerData = [];
  for (const line of lines) {
    const arr = line.trim().split(/\s+/);
    // 成功、不成功を表すフラグを取得します。
    if (arr[0] === 'a') {
      if (arr[1] === 'YES') {
        succeeded = true;
        continue;
      } else if (arr[1] === 'NO') {
        succeeded = false;
        continue;
        // 遷移ステップ データを作成します。
      } else {
        const answer: string[] = arr.slice(1);
        answerData.push(answer);
      }
    }
  }
  return [answerData, succeeded];
}

/**
 * ノードの位置データを文字列に変換します。
 * @param {NodePosition[]} nodePositionData
 * @return {string} ノードの位置を表す文字列
 */
export function convertNodePositionDataToString(
  nodePositionData: NodePosition[],
): string {
  let nodePostionStr = '';
  for (
    let nodePositionIndex = 0;
    nodePositionIndex < nodePositionData.length;
    nodePositionIndex++
  ) {
    const nodePosition = nodePositionData[nodePositionIndex];
    const boolStr = (b: boolean) => (b ? 'true' : 'false');
    nodePostionStr += `${nodePosition.id} ${nodePosition.x} ${
      nodePosition.y
    } ${boolStr(nodePosition.isStart)} ${boolStr(nodePosition.isTarget)}\n`;
  }
  return nodePostionStr;
}

/**
 * ノードの位置を表す文字列をパースしてノードの位置データを取得します。
 * @param {string} nodePositionStr ノードの位置を表す文字列
 * @return {NodePosition[]} ノードの位置データ
 */
export function parseNodePositionData(nodePositionStr: string): NodePosition[] {
  const lines = nodePositionStr.trim().split(/\r\n|\n/);
  const nodePositionData: NodePosition[] = [];
  for (const line of lines) {
    const arr = line.trim().split(/\s+/);
    const data: NodePosition = {
      id: arr[0],
      x: Number(arr[1]),
      y: Number(arr[2]),
      isStart: arr[3] === 'true' ? true : false,
      isTarget: arr[4] === 'true' ? true : false,
      isSelected: false,
    };
    nodePositionData.push(data);
  }
  return nodePositionData;
}
