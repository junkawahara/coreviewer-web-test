/** @jsxImportSource @emotion/react */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ProblemInfo } from '../ProblemInfo';
import { GraphDataContext } from './GraphDataProvider';
import { ColorNumberMap } from '../components/ColorNumberMap';
import { getColorNumberChangedData } from '../functions/GraphFunctions';

// 彩色問題における色数を選択するためのコンポーネントです。
export const ColorNumberSelectionBox = () => {
  // コンテキスト データとデータ設定用関数を取得します。
  const {
    elementData,
    problemInfo,
    setElementData,
    colorNumberMap,
    setColorNumberMap,
  } = React.useContext(GraphDataContext);

  // 現在選択されている問題情報の参照を作成します。
  const problemInfoRef = useRef<ProblemInfo | null>(null);

  // 選択されている色数を保持する状態変数を取得します。
  const [numColors, setNumColors] = useState<number>(0);

  // 問題または色数が変更された場合の処理です。
  useEffect(() => {
    const numColors = colorNumberMap[problemInfo.displayName];
    if (numColors == null || numColors < 0) {
      setNumColors(0);
    } else {
      setNumColors(numColors);
    }
    problemInfoRef.current = problemInfo;
  }, [problemInfo, colorNumberMap]);

  // コンボ ボックスの項目が変更された場合のハンドラを作成します。
  const handleChange = useCallback(
    (event: any) => {
      setNumColors(event.target.value);
      if (
        problemInfo.problemType === 'vcolor' ||
        problemInfo.problemType === 'ecolor'
      ) {
        setColorNumberMap(map => {
          const newMap: ColorNumberMap = {};
          Object.keys(map).forEach(key => {
            newMap[key] = map[key];
            if (key === problemInfo.displayName) {
              newMap[key] = event.target.value;
            }
          });
          return newMap;
        });
      }
    },
    [problemInfo, colorNumberMap],
  );

  // 自身を無効化するかどうかを表すフラグを取得します。
  const disabled = useMemo(() => {
    let disabled = false;
    if (elementData.length === 0) {
      disabled = true;
    }
    if (
      problemInfo.problemType !== 'vcolor' &&
      problemInfo.problemType !== 'ecolor'
    ) {
      disabled = true;
      setNumColors(0);
    }
    return disabled;
  }, [elementData, problemInfo]);

  // 色数が変更された場合はグラフ データを作成し直します。
  useEffect(() => {
    if (
      problemInfoRef.current &&
      (problemInfoRef.current.problemType === 'vcolor' ||
        problemInfoRef.current.problemType === 'ecolor')
    ) {
      setElementData(element => getColorNumberChangedData(element, numColors));
    }
  }, [numColors]);

  // 色数選択部を表す要素を作成します。
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div>#</div>
      <input
        disabled={disabled}
        style={{ height: '30px', width: '42px' }}
        type="number"
        value={numColors}
        onChange={handleChange}
        min={0}></input>
    </div>
  );
};
