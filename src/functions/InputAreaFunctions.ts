import { ElementDefinition } from 'cytoscape';
import { Dispatch, SetStateAction } from 'react';

import {
  cloneElement,
  getNodePositionData,
  getStartTargetIdMap,
  getStartTargetColorIndexMap,
} from './UtilFunctions';

import { ProblemInfo } from '../ProblemInfo';
import { layouts } from '../components/Layouts';
import { NodePosition, NodePositionMap } from '../components/NodePosition';
import { DisplayModeMap } from '../components/DisplayModeMap';
import { parseGraphData } from '../functions/GraphDataFunctions';
import { ColorNumberMap } from '../components/ColorNumberMap';

/**
 * グラフ データに開始、目標フラグを設定します。
 * 与えられたグラフ データに設定します。
 * @param {ElementDefinition[]} targetElementData 開始、目標フラグ設定の対象となるグラフ データ
 * @param {ElementDefinition[]} origElementData 開始、目標フラグの設定元となるデータ
 * @param {string} problemType 問題タイプ
 * @return {ElementDefinition[]} 開始、目標フラグが設定されたグラフ データ
 */
export function setStData(
  targetElementData: ElementDefinition[],
  origElementData: ElementDefinition[],
  problemType: string,
): ElementDefinition[] {
  // 設定元のグラフ データの要素が 0 より大きい場合です。
  if (origElementData.length > 0) {
    let startIdMap: { [key: string]: string } = {};
    let targetIdMap: { [key: string]: string } = {};
    let startColorIndexMap: { [key: string]: number } = {};
    let targetColorIndexMap: { [key: string]: number } = {};
    // 設定元のグラフ データから、グラフ要素の ID ごとの開始データ、目標データのマップを取得します。
    if (problemType === 'vertex' || problemType === 'edge') {
      [startIdMap, targetIdMap] = getStartTargetIdMap(
        origElementData,
        problemType,
      );
    }
    // 開始、目標色インデックスのマップを取得します。
    else if (problemType === 'vcolor' || problemType === 'ecolor') {
      [startColorIndexMap, targetColorIndexMap] = getStartTargetColorIndexMap(
        origElementData,
        problemType === 'vcolor',
      );
    }
    // 設定対象のグラフ データの要素ごとに開始、目標データを設定します。
    targetElementData.forEach(elem => {
      elem.data.isstart = false;
      elem.data.istarget = false;
      // 問題が頂点タイプの場合です。
      if (problemType === 'vertex') {
        // ノードに開始、目標データを設定します。
        if (
          elem.data.type === 'node' &&
          elem.data.id &&
          startIdMap[elem.data.id]
        ) {
          elem.data.isstart = true;
        }
        if (
          elem.data.type === 'node' &&
          elem.data.id &&
          targetIdMap[elem.data.id]
        ) {
          elem.data.istarget = true;
        }
      } else if (problemType === 'edge') {
        // 問題が辺タイプの場合です。
        // エッジに開始、目標データを設定します。
        if (
          elem.data.type === 'edge' &&
          elem.data.edgeId &&
          startIdMap[elem.data.edgeId]
        ) {
          elem.data.isstart = true;
        }
        if (
          elem.data.type === 'edge' &&
          elem.data.edgeId &&
          targetIdMap[elem.data.edgeId]
        ) {
          elem.data.istarget = true;
        }
      } else if (problemType === 'vcolor') {
        // 問題タイプが頂点彩色タイプの場合です。
        // 頂点の開始、目標色インデックスを設定します。
        if (elem.data.type === 'node' && elem.data.id) {
          if (startColorIndexMap[elem.data.id]) {
            elem.data.startcolorindex = startColorIndexMap[elem.data.id];
          }
          if (targetColorIndexMap[elem.data.id]) {
            elem.data.targetcolorindex = targetColorIndexMap[elem.data.id];
          }
        }
      } else if (problemType === 'ecolor') {
        // 問題タイプが辺彩色タイプの場合です。
        // エッジの開始、目標色インデックスを設定します。
        if (elem.data.type === 'edge' && elem.data.edgeId) {
          if (startColorIndexMap[elem.data.edgeId]) {
            elem.data.startcolorindex = startColorIndexMap[elem.data.edgeId];
          }
          if (targetColorIndexMap[elem.data.edgeId]) {
            elem.data.targetcolorindex = targetColorIndexMap[elem.data.edgeId];
          }
        }
      }
    });
    return targetElementData;
  } else {
    return targetElementData;
  }
}

/**
 * 開始、目標データが設定されたグラフ データを取得します。
 * 新しくグラフ データを作成します。
 * @param {ElementDefinition[]} targetElementData 設定の対象となるグラフ データ (このデータのコピーに開始、目標データが設定される)
 * @param {string[]} starts 開始データ リスト
 * @param {string[]} targets 目標データ リスト
 * @param {string} problemType 問題タイプ
 * @return {ElementDefinition[]} 開始、目標データが設定されたグラフ データ
 */
export function getElementDataWithStData(
  targetElementData: ElementDefinition[],
  starts: string[],
  targets: string[],
  problemType: string,
): ElementDefinition[] {
  const newElementData: ElementDefinition[] = [];
  if (problemType === 'vertex') {
    // 問題が頂点タイプの場合です。
    targetElementData.forEach(elem => {
      const newElem = cloneElement(elem);
      newElem.data.isstart = false;
      newElem.data.istarget = false;
      // ノードに開始、目標データを設定します
      if (elem.data.type === 'node') {
        if (elem.data.id && starts.includes(elem.data.id)) {
          newElem.data.isstart = true;
        }
        if (elem.data.id && targets.includes(elem.data.id)) {
          newElem.data.istarget = true;
        }
      }
      newElementData.push(newElem);
    });
  } else if (problemType === 'edge') {
    // 問題が辺タイプの場合です。
    targetElementData.forEach(elem => {
      const newElem = cloneElement(elem);
      newElem.data.isstart = false;
      newElem.data.istarget = false;
      // エッジに開始、目標データを設定します
      if (elem.data.type === 'edge') {
        if (elem.data.edgeId && starts.includes(elem.data.edgeId)) {
          newElem.data.isstart = true;
        }
        if (elem.data.edgeId && targets.includes(elem.data.edgeId)) {
          newElem.data.istarget = true;
        }
      }
      newElementData.push(newElem);
    });
  } else if (problemType === 'vcolor') {
    // 問題が頂点彩色タイプの場合です。
    targetElementData.forEach(elem => {
      const newElem = cloneElement(elem);
      newElem.data.isstart = false;
      newElem.data.istarget = false;
      // 色インデックスを設定します
      if (elem.data.type === 'node' && elem.data.id) {
        const nodeId = parseInt(elem.data.id);
        if (Number.isNaN(nodeId)) {
          return;
        }
        newElem.data.startcolorindex =
          nodeId <= starts.length ? starts[nodeId - 1] : -1;
        newElem.data.targetcolorindex =
          nodeId <= targets.length ? targets[nodeId - 1] : -1;
      }
      newElementData.push(newElem);
    });
  } else if (problemType === 'ecolor') {
    // 問題が辺彩色タイプの場合です。
    targetElementData.forEach(elem => {
      const newElem = cloneElement(elem);
      newElem.data.isstart = false;
      newElem.data.istarget = false;
      // 色インデックスを設定します
      if (elem.data.type === 'edge' && elem.data.edgeId) {
        const edgeId = parseInt(elem.data.edgeId);
        if (Number.isNaN(edgeId)) {
          return;
        }
        newElem.data.startcolorindex =
          edgeId <= starts.length ? starts[edgeId - 1] : -1;
        newElem.data.targetcolorindex =
          edgeId <= targets.length ? targets[edgeId - 1] : -1;
      }
      newElementData.push(newElem);
    });
  }
  return newElementData;
}

/**
 * 与えられたグラフ データに対応するノード位置データを取得します。
 * 取得する位置データは、与えられた位置データから、与えられたグラフ データに対応する要素のみ取り出したものとなります。
 * @param {ElementDefinition[]} elementData 位置データ作成の基準となるグラフ データ
 * @param {NodePosition} origNodePositions 元の位置データ
 * @return {NodePosition[]} 与えられたグラフ データに対応する位置データ
 */
export function getNodePositionDataForElementData(
  elementData: ElementDefinition[],
  origNodePositions: NodePosition[],
): NodePosition[] {
  const newNodePositions: NodePosition[] = [];
  elementData.forEach(elem => {
    // 要素がノードの場合です。
    if (elem.data.type === 'node') {
      // ノードに設定されている座標値を取得します。
      const newPosition = getNodePositionData(elem);
      newPosition.x = 0;
      newPosition.y = 0;
      if (elem.data.id) {
        // 現在の要素と ID が一致するノード位置データを取得します。
        const targetNps = origNodePositions.filter(nodePosition => {
          return nodePosition.id === elem.data.id;
        });
        if (targetNps.length > 0) {
          newPosition.x = targetNps[0].x;
          newPosition.y = targetNps[0].y;
        }
      }
      newNodePositions.push(newPosition);
    }
  });
  return newNodePositions;
}

/**
 * 組合せ遷移問題の入力データを読み込みます。
 * @param {string} path
 * @param {string} data
 * @param {ElementDefinition[]} elementData 現在のグラフ データ
 * @param {ProblemInfo} problemInfo 現在選択されている問題の情報
 * @param {NodePositionMap} customNodePositionMap 問題ごとのカスタム レイアウト時の位置データのマップ
 * @param {DisplayModeMap} displayModeMap 問題ごとの表示情報のマップです。
 * @param {Dispatch<SetStateAction<ColorNumberMap>>} setColorNumberMap 問題ごとの色数のマップを設定する関数です。
 * @param {Dispatch<SetStateAction<ElementDefinition[]>>} setElementData グラフ データを設定する関数です。
 * @param {Dispatch<SetStateAction<NodePosition[]>>} setNodePositions ノードの位置データを設定する関数です。
 * @param { Dispatch<SetStateAction<any>>} setLayout レイアウトを設定する関数です。
 * @param { Dispatch<SetStateAction<any>>} setEditMode 編集モードの有効/無効を設定する関数です。
 */
export function readInputFile(
  path: string,
  data: string,
  elementData: ElementDefinition[],
  problemInfo: ProblemInfo,
  customNodePositionMap: NodePositionMap,
  displayModeMap: DisplayModeMap,
  setColorNumberMap: Dispatch<SetStateAction<ColorNumberMap>>,
  setElementData: Dispatch<SetStateAction<ElementDefinition[]>>,
  setNodePositions: Dispatch<SetStateAction<NodePosition[]>>,
  setLayout: Dispatch<SetStateAction<any>>,
  setEditMode: Dispatch<SetStateAction<boolean>>,
): void {
  // 読み込み直後のレイアウトです。
  const initLayout = layouts.random;

  // ファイル内のデータをパースします。
  let [elements, errorMessages, starts, targets, numColors, nps, dataType] =
    parseGraphData(data, problemInfo.problemType);

  // ファイル読み込みに成功した場合は、読み込んだデータ用いて現在のグラフ データを更新します。
  if (errorMessages.length === 0) {
    switch (dataType) {
      // データの種類が全体データの場合です。
      case 'wholedata':
        setElementData(elements);
        if (
          problemInfo.problemType === 'vcolor' ||
          problemInfo.problemType === 'ecolor'
        ) {
          setColorNumberMap(map => {
            const newMap: ColorNumberMap = {};
            Object.keys(map).forEach(key => {
              newMap[key] = map[key];
              if (key === problemInfo.displayName) {
                newMap[key] = numColors;
              }
            });
            return newMap;
          });
        }
        break;
      // データの種類がグラフ データの場合です。
      case 'graphdata':
        // 読み込んだグラフ データに開始、目標フラグを設定します。
        elements = setStData(elements, elementData, problemInfo.problemType);
        setElementData(elements);
        break;
      // データの種類が開始、目標データの場合です。
      case 'stdata':
        // 既にデータが読み込まれている場合のみ、読み込んだ開始、目標データを設定します。
        if (elementData.length > 0) {
          // 現在のグラフ データに読み込んだ開始、目標データを設定したデータを新たに取得します。
          const newElementData = getElementDataWithStData(
            elementData,
            starts,
            targets,
            problemInfo.problemType,
          );
          setElementData(newElementData);
          if (
            problemInfo.problemType === '' ||
            problemInfo.problemType === 'ecolor'
          ) {
            setColorNumberMap(map => {
              const newMap: ColorNumberMap = {};
              Object.keys(map).forEach(key => {
                newMap[key] = map[key];
                if (key === problemInfo.displayName) {
                  newMap[key] = numColors;
                }
              });
              return newMap;
            });
          }
          // データが読み込まれていない場合はエラー メッセージを表示します。
        } else {
          window.apiData.showErrorBox(
            'エラー',
            `ファイル読み込み中に以下のエラーが発生しました。\n\n` +
              `開始、目標データの読み込みに失敗しました。\n開始、目標データを読み込む前にグラフ データを読み込んでください。\n` +
              `* ファイル パス：${path}\n`,
          );
        }
        break;
    }

    // データの種類が開始、目標データ以外の場合です。
    if (dataType !== 'stdata') {
      // カスタム レイアウトをリセットします。
      if (customNodePositionMap[problemInfo.displayName]) {
        customNodePositionMap[problemInfo.displayName] = [];
      }

      // ノード位置データを読み込んだ場合です。
      if (nps.length > 0) {
        // 表示形式を拡張形式にします。
        displayModeMap[problemInfo.displayName] = 'extension';
        // 読み込まれたグラフ データにあわせノード位置データを取得します。
        const newNodePositions = getNodePositionDataForElementData(
          elements,
          nps,
        );
        setNodePositions(newNodePositions);
        // カスタム レイアウトに変更します。
        setLayout({
          name: 'preset',
          animate: false,
          fit: false,
          positions: undefined,
          center: true,
        });
        // ノード位置データが読み込まれていない場合です。
      } else {
        // 表示形式を通常形式にします。
        displayModeMap[problemInfo.displayName] = 'normal';
        // デフォルトの初期レイアウトに変更します。
        setLayout(layouts.null);
        setLayout(initLayout);
      }
    }
    // 編集モードを無効化します。
    setEditMode(false);
  } else {
    // ファイル読み込みに失敗した場合はエラー ボックスを表示します。
    window.apiData.showErrorBox(
      'エラー',
      `ファイル読み込み中に以下のエラーが発生しました。\n\n` +
        `${errorMessages[0]}\n` +
        `* ファイル パス：${path}\n` +
        `${errorMessages[1]}`,
    );
  }
}
