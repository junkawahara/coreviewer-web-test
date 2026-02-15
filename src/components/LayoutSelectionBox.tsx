import { ElementDefinition } from 'cytoscape';
import React, {
  Dispatch,
  useCallback,
  useEffect,
  useLayoutEffect,
} from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { GraphDataContext } from './GraphDataProvider';
import { layouts } from './Layouts';
import { NodePosition, NodePositionMap } from './NodePosition';
import { ProblemInfo } from '../ProblemInfo';

/**
 * レイアウト選択用コンボ ボックスのプロパティを表す型です。
 */
type LayoutSelectionProp = {
  // レイアウトです。
  layout: any;
  // レイアウトを設定する関数です。
  setLayout: Dispatch<any>;
  // コンボ ボックスが無効化されているかどうかを表すフラグです。
  disabled: boolean;
};

/**
 * 与えられた ID に対応するノード位置を取得します。
 * @param {string} id ノードの ID
 * @param {NodePosition[]} nodePositions ノード位置情報リスト
 * @return {number[]} 与えられた ID に対応するノード位置
 */
function getNodePosition(id: string, nodePositions: NodePosition[]): number[] {
  const ret: number[] = [];
  const targetNodePositions = nodePositions.filter(
    nodePosition => nodePosition.id === id,
  );
  if (targetNodePositions) {
    if (
      targetNodePositions[0].x !== undefined &&
      targetNodePositions[0].y !== undefined
    ) {
      ret.push(targetNodePositions[0].x);
      ret.push(targetNodePositions[0].y);
    }
  }
  return ret;
}

// レイアウト選択用コンボ ボックスを表す関数コンポーネントを定義します。
export const LayoutSelectionBox = (prop: LayoutSelectionProp) => {
  // 引数から各プロパティを取得します。
  const { layout, setLayout, disabled } = prop;

  // グラフの要素のデータとそれを操作する関数を取得します。
  const {
    customNodePositionMap,
    setCustomNodePositionMap,
    elementData,
    setElementData,
    nodePositions,
    setNodePositions,
    problemInfo,
    problemInfoMap,
  } = React.useContext(GraphDataContext);

  // 選択ボックスのオープン状態を表すフラグを保持する状態変数を取得します。
  const [open, setOpen] = React.useState(false);

  // 問題の変更時の処理です。
  useLayoutEffect(() => {
    // 変更先の問題にあわせてカスタム レイアウト用に保存されているノード位置を再設定します。
    const curNodePositionMap: NodePositionMap = {};
    Object.keys(problemInfoMap).forEach(key => {
      curNodePositionMap[key] = [];
    });
    setCustomNodePositionMap(curNodePositionMap);
  }, [problemInfoMap]);

  // ノードの位置データ変更時の処理です。
  useEffect(() => {
    // カスタム レイアウトの場合です。
    if (layout.name === 'preset') {
      // ノードの位置データをマップに保存します。
      customNodePositionMap[problemInfo.displayName] = nodePositions;
      setElementData(elems => {
        const newElems = [...elems];
        newElems.forEach(elem => (elem.data.customLayoutId = elem.data.id));
        return newElems;
      });
    }
  }, [nodePositions]);

  // レイアウト名選択時の処理を行うハンドラを作成します。
  const handleChange = useCallback(
    (event: any) => {
      switch (event.target.value) {
        // Breadthfirst レイアウトの場合です。
        case 'breadthfirst':
          setLayout(layouts.breadthfirst);
          break;
        // Circle レイアウトの場合です。
        case 'circle':
          setLayout(layouts.circle);
          break;
        // Cose レイアウトの場合です。
        case 'cose':
          setLayout(layouts.cose);
          break;
        // Concentric レイアウトの場合です。
        case 'concentric':
          setLayout(layouts.concentric);
          break;
        // Cose-bilkent レイアウトの場合です。
        case 'cose-bilkent':
          setLayout(layouts.coseBilkent);
          break;
        // Grid レイアウトの場合です。
        case 'grid':
          setLayout(layouts.grid);
          break;
        // Random レイアウトの場合です。
        case 'random':
          setLayout(layouts.random);
          break;
        // Custom レイアウトの場合です。
        // Custom レイアウトは cytescape 標準の preset レイアウトに対応します。
        case 'preset':
          setCustomLatyout(
            elementData,
            nodePositions,
            problemInfo,
            customNodePositionMap,
            setElementData,
            setNodePositions,
            setLayout,
          );
          break;
        default:
          break;
      }
    },
    [nodePositions, problemInfo, customNodePositionMap, elementData],
  );

  // 選択ボックスのオープン時、およびクローズ時の処理を行うハンドラを作成します。
  const onClosed = useCallback(() => {
    setOpen(false);
  }, []);
  const onOpened = useCallback(() => {
    setOpen(true);
  }, []);

  // レイアウト選択用コンボ ボックスを表す要素を作成します。
  return (
    <div>
      <FormControl sx={{ m: 1, minWidth: 120 }}>
        <InputLabel>Layout</InputLabel>
        <Select
          disabled={disabled}
          open={open}
          onClose={onClosed}
          onOpen={onOpened}
          value={layout.name}
          label="Layout"
          onChange={handleChange}>
          <MenuItem value={'breadthfirst'}>BreadthFirst</MenuItem>
          <MenuItem value={'cose'}>Cose</MenuItem>
          <MenuItem value={'concentric'}>Concentric</MenuItem>
          <MenuItem value={'cose-bilkent'}>CoseBilkent</MenuItem>
          <MenuItem value={'circle'}>Circle</MenuItem>
          <MenuItem value={'grid'}>Grid</MenuItem>
          <MenuItem value={'random'}>Random</MenuItem>
          <MenuItem value={'preset'}>Custom</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

/**
 * 現在の ID とカスタム レイアウト時の ID のマップを取得します。
 * @param {ElementDefinition[]} elements グラフ データ
 * @return {any} 現在の ID とカスタム レイアウト時の ID のマップ
 */
function getCustomLayoutIdMap(elements: ElementDefinition[]): any {
  const map: { [key: string]: string } = {};
  elements.forEach(elem => {
    if (elem.data.id && elem.data.type === 'node' && elem.data.customLayoutId) {
      map[elem.data.id] = elem.data.customLayoutId;
    }
  });
  return map;
}

/**
 * カスタム レイアウト選択時の処理です。
 * @param {ElementDefinition[]} elementData 現在のグラフ データ
 * @param {NodePosition[]} nodePositions 現在の各ノードの位置データ
 * @param {ProblemInfo} problemInfo 現在選択されている問題の情報
 * @param {NodePositionMap} customNodePositionMap 問題ごとのカスタム レイアウトにおけるノード位置のマップ
 * @param {React.Dispatch<React.SetStateAction<ElementDefinition[]>>} setElementData グラフのデータを設定する関数
 * @param {React.Dispatch<React.SetStateAction<NodePosition[]>>} setNodePositions ノードの位置データを設定する関数
 * @param {Dispatch<any>} setLayout レイアウト設定を行う関数
 */
function setCustomLatyout(
  elementData: ElementDefinition[],
  nodePositions: NodePosition[],
  problemInfo: ProblemInfo,
  customNodePositionMap: NodePositionMap,
  setElementData: React.Dispatch<React.SetStateAction<ElementDefinition[]>>,
  setNodePositions: React.Dispatch<React.SetStateAction<NodePosition[]>>,
  setLayout: Dispatch<any>,
): void {
  // 保存されているノード位置データを取得します。
  const customNodePositions = customNodePositionMap[problemInfo.displayName];
  // ノード位置データが保存されている場合です。
  if (customNodePositions.length > 0) {
    // preset レイアウト オブジェクトを作成し、レイアウトとして設定します。
    const customLayout = {
      name: 'preset',
      animate: false,
      fit: false,
      position: undefined,
      center: true,
    };
    setLayout(customLayout);
    setNodePositions(nps => {
      // 現在のグラフ データに含まれる要素のうち、
      // カスタム レイアウトの対象となる要素 (カスタム レイアウト用の ID が設定されている要素) に対し、
      // 保存されていたノード位置データを設定します。
      const newNodePositions: NodePosition[] = [...nps];
      const customLayoutIdMap = getCustomLayoutIdMap(elementData);
      newNodePositions.forEach(newNpdePosition => {
        const customLayoutId = customLayoutIdMap[newNpdePosition.id];
        if (customLayoutId) {
          const customLayoutPos = getNodePosition(
            customLayoutId,
            customNodePositions,
          );
          if (customLayoutPos.length >= 2) {
            newNpdePosition.x = customLayoutPos[0];
            newNpdePosition.y = customLayoutPos[1];
          }
        }
      });
      return newNodePositions;
    });
    // ノード位置データが保存されていない場合です。
  } else {
    // 現在のノード位置データをマップに保存します。
    customNodePositionMap[problemInfo.displayName] = nodePositions;
    // preset レイアウト オブジェクトを作成し、レイアウトとして設定します。
    const customLayout = {
      name: 'preset',
      animate: false,
      fit: false,
      positions: undefined,
      center: false,
    };
    setLayout(customLayout);
    // グラフ データにカスタム レイアウト用の ID を設定します。
    setElementData(elems => {
      const newElems = [...elems];
      newElems.forEach(elem => (elem.data.customLayoutId = elem.data.id));
      return newElems;
    });
  }
}
