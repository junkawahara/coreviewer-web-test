/** @jsxImportSource @emotion/react */

import React, { useCallback, useEffect, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { GraphDataContext } from './GraphDataProvider';

// 問題タイプを選択するためのコンポーネントです。
export const ProblemSelectionBox = () => {
  // コンテキスト データとデータ設定用関数を取得します。
  const { problemInfo, setProblemInfo, problemInfoMap } =
    React.useContext(GraphDataContext);

  // コンボ ボックスの表示名を保持する状態変数を取得します。
  const [disp, setDisp] = useState<string>('');

  // 問題マップ変更時の処理です。
  useEffect(() => {
    const keys = Object.keys(problemInfoMap);
    // 問題マップに含まれる一番最初のキーの問題をコンボ ボックスに設定します。
    if (keys.length !== 0) {
      setProblemInfo(problemInfoMap[keys[0]]);
    }
  }, [problemInfoMap]);

  // コンボ ボックスの項目が変更された場合のハンドラを作成します。
  const handleChange = useCallback(
    (event: any) => {
      setProblemInfo(problemInfoMap[event.target.value]);
    },
    [problemInfoMap],
  );

  // 問題が変更された場合の処理です。
  useEffect(() => {
    // コンボ ボックスの表示項目を変更します。
    if (Object.keys(problemInfoMap).length !== 0) {
      setDisp(problemInfo.displayName);
    }
  }, [problemInfo]);

  // 問題選択コンボ ボックスを表す要素を作成します。
  return (
    <>
      <Select
        value={disp}
        onChange={handleChange}
        sx={{ height: '40px', width: '100%', textAlign: 'center' }}>
        {/* 問題情報マップに含まれる各問題の表示名をコンボ ボックスに列挙します。 */}
        {Object.keys(problemInfoMap).map((elem, index) => {
          const curProblemInfo = problemInfoMap[elem];
          return curProblemInfo ? (
            <MenuItem key={index} value={curProblemInfo.displayName}>
              {curProblemInfo.displayName}
            </MenuItem>
          ) : (
            <></>
          );
        })}
      </Select>
    </>
  );
};
