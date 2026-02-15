import { ElementDefinition } from 'cytoscape';

import { NodePosition } from '../components/NodePosition';

/**
 * グラフの要素データのクローンを作成します。
 * @param {ElementDefinition} element クローン元のグラフ要素データ
 * @return {ElementDefinition} クローンしたグラフ要素データ
 */
export function cloneElement(element: ElementDefinition) {
  return {
    data: {
      id: element.data.id,
      source: element.data.source,
      target: element.data.target,
      isstart: element.data.isstart,
      istarget: element.data.istarget,
      startcolorindex: element.data.startcolorindex,
      targetcolorindex: element.data.targetcolorindex,
      edgeId: element.data.edgeId,
      type: element.data.type,
      label: element.data.label,
      customLayoutId: element.data.customLayoutId,
    },
  };
}

/**
 * エッジに関するデータが等価であるかどうかを判定します。
 * @param {string}source1 エッジ 1 のソース
 * @param {string}target1 エッジ 1 のターゲット
 * @param {string}source2 エッジ 2 のソース
 * @param {string} target2 エッジ 2 のターゲット
 * @return {boolean} エッジが等価な場合は true。透過でない場合は false
 */
export function edgeEqual(
  source1: string,
  target1: string,
  source2: string,
  target2: string,
): boolean {
  return (
    (source1 === source2 && target1 === target2) ||
    (source1 === target2 && target1 === source2)
  );
}

/**
 * エッジに関するデータが等価であるかどうかを判定します。
 * 与えられたデータがエッジであるかどうかもあわせて確認します。
 * @param {string} source エッジ 1 のソース
 * @param {string} target エッジ 1 のターゲット
 * @param {ElementDefinition} elem エッジ 2 を表すデータ
 * @return {boolean} エッジが等価な場合は true。透過でない場合は false
 */
export function edgeDataEqual(
  source: string,
  target: string,
  elem: ElementDefinition,
): boolean {
  if (elem.data.type !== 'edge') {
    // エッジではないデータが与えられた場合は常に false を返します。
    return false;
  } else {
    return edgeEqual(source, target, elem.data.source, elem.data.target);
  }
}

/**
 * エッジのデータを取得します。
 * @param {string} source エッジのソース ノードの ID
 * @param {string} target エッジのターゲット ノードの ID
 * @param {number} id エッジの ID
 * @return {ElementDefinition} エッジのデータ
 */
export function getEdgeData(
  source: string,
  target: string,
  id: number,
): ElementDefinition {
  return {
    data: {
      id: `${source}-${target}`,
      edgeId: `${id}`,
      source,
      target,
      label: `Edge${id}`,
      type: 'edge',
      isstart: false,
      istarget: false,
      startcolorindex: -1,
      targetcolorindex: -1,
    },
  };
}

/**
 * 開始集合 ID と目標集合 ID のマップを取得します。
 * @param {ElementDefinition[]} elements グラフのデータ
 * @param {string} problemType 問題の種類
 * @return {[any, any]} 開始 ID のマップと終了 ID のマップ
 */
export function getStartTargetIdMap(
  elements: ElementDefinition[],
  problemType: string,
): [startIdMap: any, targetIdMap: any] {
  const startIdMap: { [key: string]: string } = {};
  const targetIdMap: { [key: string]: string } = {};

  elements.forEach(elem => {
    switch (problemType) {
      case 'vertex':
        if (elem.data.type === 'node' && elem.data.id) {
          startIdMap[elem.data.id] = elem.data.isstart;
          targetIdMap[elem.data.id] = elem.data.istarget;
        }
        break;
      case 'edge':
        if (elem.data.type === 'edge' && elem.data.edgeId) {
          startIdMap[elem.data.edgeId] = elem.data.isstart;
          targetIdMap[elem.data.edgeId] = elem.data.istarget;
        }
        break;
    }
  });

  return [startIdMap, targetIdMap];
}

/**
 * 色インデックスのマップを取得します。
 * @param {ElementDefinition[]} elements グラフのデータ
 * @param {boolean} forNodeType 頂点彩色タイプを対象とするかどうかを表すフラグ
 * @return {[any, any]} 頂点ごとの色インデックスのマップ
 */
export function getStartTargetColorIndexMap(
  elements: ElementDefinition[],
  forNodeType: boolean,
): [startColorIndexMap: any, targetColorIndexMap: any] {
  const startColorIndexMap: { [key: string]: number } = {};
  const targetColorIndexMap: { [key: string]: number } = {};

  elements.forEach(elem => {
    if (forNodeType) {
      if (elem.data.type === 'node' && elem.data.id) {
        startColorIndexMap[elem.data.id] = elem.data.startcolorindex;
        targetColorIndexMap[elem.data.id] = elem.data.targetcolorindex;
      }
    } else {
      if (elem.data.type === 'edge' && elem.data.edgeId) {
        startColorIndexMap[elem.data.edgeId] = elem.data.startcolorindex;
        targetColorIndexMap[elem.data.edgeId] = elem.data.targetcolorindex;
      }
    }
  });

  return [startColorIndexMap, targetColorIndexMap];
}

/**
 * データ要素 ID に対するデータのマップを取得します。
 * @param {ElementDefinition[]} elements グラフのデータ
 * @param {string} problemType 問題の種類
 * @return {any} データ要素 ID に対するデータのマップ
 */
export function getElementDataMap(
  elements: ElementDefinition[],
  problemType: string,
): any {
  const elementMap: { [key: string]: ElementDefinition } = {};
  elements.forEach(elem => {
    switch (problemType) {
      case 'vertex':
        if (elem.data.type === 'node' && elem.data.id) {
          elementMap[elem.data.id] = elem;
        }
        break;
      case 'edge':
        if (elem.data.type === 'edge' && elem.data.edgeId) {
          elementMap[elem.data.edgeId] = elem;
        }
        break;
    }
  });

  return elementMap;
}

/**
 * 与えられたデータ要素に対するノード位置情報のひな形を取得します。
 * @param {ElementDefinition} elementData グラフのデータ。
 * @return {NodePosition} ノード位置情報のひな形
 */
export function getNodePositionData(
  elementData: ElementDefinition,
): NodePosition {
  return {
    id: elementData.data.id === undefined ? '' : elementData.data.id,
    isStart: elementData.data.isstart,
    isTarget: elementData.data.istarget,
    x: undefined,
    y: undefined,
    isSelected:
      elementData.selected === undefined ? false : elementData.selected,
  };
}

/**
 * グラフのノード要素をソートするための比較関数です。
 * @param {ElementDefinition} element1 比較対象のノード要素 1
 * @param {ElementDefinition} element2 比較対象のノード要素 2
 * @return {number} element 1 の順番が element2 より前の場合は -1、後の場合は +1 、同じ順番の場合は 0 を返す。
 */
export function compareNodes(
  element1: ElementDefinition,
  element2: ElementDefinition,
): number {
  let element1Id = Infinity;
  if (element1.data.id !== undefined) {
    element1Id = parseInt(element1.data.id);
  }
  let element2Id = Infinity;
  if (element2.data.id !== undefined) {
    element2Id = parseInt(element2.data.id);
  }
  if (element1Id === element2Id) {
    return 0;
  } else {
    return element1Id < element2Id ? -1 : 1;
  }
}

/**
 * グラフのエッジ要素をソートするための比較関数です。
 * @param {ElementDefinition} element1 比較対象のエッジ要素 1
 * @param {ElementDefinition} element2 比較対象のエッジ要素 2
 * @return {number} element 1 の順番が element2 より前の場合は -1、後の場合は +1 、同じ順番の場合は 0 を返す。
 */
export function compareEdges(
  element1: ElementDefinition,
  element2: ElementDefinition,
): number {
  let element1Id = Infinity;
  if (element1.data.type === 'edge' && element1.data.edgeId) {
    element1Id = parseInt(element1.data.edgeId);
  } else if (element1.data.id) {
    element1Id = parseInt(element1.data.id);
  }
  let element2Id = Infinity;
  if (element2.data.type === 'edge' && element2.data.edgeId) {
    element2Id = parseInt(element2.data.edgeId);
  } else if (element2.data.id) {
    element2Id = parseInt(element2.data.id);
  }
  if (element1Id === element2Id) {
    return 0;
  } else {
    return element1Id < element2Id ? -1 : 1;
  }
}

/**
 * グラフ データをソートするための比較関数です。
 * @param {ElementDefinition} element1 比較対象の要素 1
 * @param {ElementDefinition} element2 比較対象の要素 2
 * @return {number} element 1 の順番が element2 より前の場合は -1、後の場合は +1 、同じ順番の場合は 0 を返す。
 */
export function compareElements(
  element1: ElementDefinition,
  element2: ElementDefinition,
): number {
  // 引数 1 がノードで引数 2 がノード以外の場合は引数 1 を前にします。
  if (element1.data.type === 'node' && element2.data.type !== 'node') {
    return -1;
  }
  // 引数 1 がノード以外で引数 2 がノードの場合は引数 1 を後にします。
  if (element1.data.type !== 'node' && element2.data.type === 'node') {
    return +1;
  }
  // 引数 1、2 がともにノードの場合です。
  if (element1.data.type === 'node' && element2.data.type === 'node') {
    return compareNodes(element1, element2);
    // 引数 1、2 がともにエッジの場合です。
  } else if (element1.data.type === 'edge' && element2.data.type === 'edge') {
    return compareEdges(element1, element2);
  }
  return 0;
}

/**
 * 表示色のリストを作成します。
 * @param {number} numColors 色数
 * @return {string[]} 表示色のリスト
 */
export function createColors(numColors: number): string[] {
  const allClors: string[] = [
    '#0000FF',
    '#00FF00',
    '#FF0000',
    '#FF00FF',
    '#00FFFF',
    '#FFFF00',
    '#FFFFFF',
    '#000000',
    '#0000EE',
    '#00EE00',
    '#EE0000',
    '#FF11FF',
    '#22FFFF  ',
    '#FFFF11',
    '#EEEEEE',
    '#000080',
    '#0000DD',
    '#00DD00',
    '#DD0000',
    '#FF22FF',
    '#CCFFFF',
    '#FFFFCC',
    '#DDDDDD',
    '#0000FF',
    '#0000CC',
    '#00CC00',
    '#CC0000',
    '#FFBBFF',
    '#BBFFFF',
    '#FFFFBB',
    '#CCCCCC',
    '#008000',
    '#0000BB',
    '#00BB00',
    '#BB0000',
    '#FFAAFF',
    '#AAFFFF',
    '#FFFFAA',
    '#BBBBBB',
    '#008080',
    '#0000AA',
    '#00AA00',
    '#AA0000',
    '#FF99FF',
    '#99FFFF',
    '#FFFF99',
    '#AAAAAA',
    '#00FF00',
    '#000099',
    '#009900',
    '#990000',
    '#FF88FF',
    '#88FFFF',
    '#FFFF88',
    '#999999',
    '#00FFFF',
    '#000088',
    '#008800',
    '#880000',
    '#FF77FF',
    '#77FFFF',
    '#FFFF77',
    '#888888',
    '#800000',
    '#000077',
    '#007700',
    '#770000',
    '#FF66FF',
    '#66FFFF',
    '#FFFF66',
    '#777777',
    '#800080',
    '#000066',
    '#006600',
    '#660000',
    '#FF55FF',
    '#55FFFF',
    '#FFFF55',
    '#666666',
    '#808000',
    '#000055',
    '#005500',
    '#550000',
    '#FF44FF',
    '#44FFFF',
    '#FFFF44',
    '#555555',
    '#808080',
    '#000044',
    '#004400',
    '#440000',
    '#FF33FF',
    '#33FFFF',
    '#FFFF33',
    '#444444',
    '#C0C0C0',
    '#000033',
    '#003300',
    '#330000',
    '#FF22FF',
    '#22FFFF',
    '#FFFF22',
    '#333333',
    '#FF0000',
    '#000022',
    '#002200',
    '#220000',
    '#FF11FF',
    '#11FFFF',
    '#FFFF11',
    '#222222',
    '#FF00FF',
    '#000011',
    '#001100',
    '#110000',
    '#FF00FF',
    '#00FFFF',
    '#FFFF00',
    '#111111',
    '#FFFF00',
    '#FFDBC9',
    '#FFD5EC',
    '#EAD9FF',
    '#D9E5FF',
    '#D7EEFF',
    '#F3FFD8',
    '#CEF9DC',
    '#E6FFE9',
    '#FFC7AF',
    '#FFBEDA',
    '#DCC2FF',
    '#BAD3FF',
    '#C2EEFF',
    '#EDFFBE',
    '#B1F9D0',
    '#CBFFD3',
    '#FFAD90',
    '#FFABCE',
    '#D0B0FF',
    '#A4C6FF',
    '#A7F1FF',
    '#E9FFA5',
    '#9BF9CC',
    '#AEFFBD',
    '#FF9872',
    '#FF97C2',
    '#C299FF',
    '#8EB8FF',
    '#8EF1FF',
    '#E4FF8D',
    '#86F9C5',
    '#93FFAB',
    '#FF8856',
    '#FF82B2',
    '#B384FF',
    '#75A9FF',
    '#77EEFF',
    '#DBFF71',
    '#77F9C3',
    '#78FF94',
    '#FF773E',
    '#FF69A3',
    '#A16EFF',
    '#5D99FF',
    '#60EEFF',
    '#D6FF58',
    '#64F9C1',
    '#5BFF7F',
    '#FF6928',
    '#FF5192',
    '#9057FF',
    '#4689FF',
    '#46EEFF',
    '#D0FF43',
    '#4DF9B9',
    '#43FF6B',
    '#FF5F17',
    '#FF367F',
    '#7B3CFF',
    '#2C7CFF',
    '#32EEFF',
    '#C9FF2F',
    '#30F9B2',
    '#2DFF57',
    '#FF570D',
    '#FF1A6F',
    '#6927FF',
    '#136FFF',
    '#13EEFF',
    '#BEFF15',
    '#17F9AD',
    '#1BFF4A',
    '#FF4F02',
    '#FF0461',
    '#5507FF',
    '#005FFF',
    '#00ECFF',
    '#B6FF01',
    '#00F9A9',
    '#00FF3B',
  ];

  if (numColors <= allClors.length) {
    return allClors.slice(0, numColors);
  } else {
    const r = numColors / allClors.length;
    const p = numColors % allClors.length;
    let ret: string[] = [];
    for (let x = 0; x < r; x++) {
      ret = ret.concat(allClors);
    }
    for (let x = 0; x < p; x++) {
      ret.push(allClors[x]);
    }
    return ret;
  }
}

/**
 * HSV 値を RGB 値に変換します。
 * @param {number} h H 値
 * @param {number} s S 値
 * @param {number} v V 値
 * @return {string} 16 進 RGB 値を表す文字列
 */
function convertHSVToRGB(h: number, s: number, v: number): string {
  let rgb: number[] = [];
  const _h = h / 60;
  const _s = s / 100;
  const _v = v / 100;
  if (_s == 0) {
    rgb = [_v, _v, _v];
  } else {
    const i = Math.floor(_h);
    const f = _h - i;
    const v1 = _v * (1 - _s);
    const v2 = _v * (1 - _s * f);
    const v3 = _v * (1 - _s * (1 - f));
    switch (i) {
      case 0:
      case 6:
        rgb = [_v, v3, v1];
        break;

      case 1:
        rgb = [v2, _v, v1];
        break;

      case 2:
        rgb = [v1, _v, v3];
        break;

      case 3:
        rgb = [v1, v2, _v];
        break;

      case 4:
        rgb = [v3, v1, _v];
        break;

      case 5:
        rgb = [_v, v1, v2];
        break;
    }
  }
  const toHex = (v: number) => {
    return ('0' + v.toString(16).toUpperCase()).substr(-2);
  };
  const rHex = toHex(Math.round(rgb[0] * 255));
  const gHex = toHex(Math.round(rgb[1] * 255));
  const bHex = toHex(Math.round(rgb[2] * 255));
  return `#${rHex}${gHex}${bHex}`;
}
