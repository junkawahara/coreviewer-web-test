/** @jsxImportSource @emotion/react */

import { ElementDefinition, Stylesheet } from 'cytoscape';
import Button from '@mui/material/Button';
import { css } from '@emotion/react';
import TextField from '@mui/material/TextField';
import React, { useLayoutEffect, useState } from 'react';

import { AnswerData } from './AnswerData';
import { EdgeTypeResultGraph } from './EdgeTypeResultGraph';
import { NodePosition } from './NodePosition';
import { ResultGraph } from './ResultGraph';
import { EColorTypeResultGraph } from './EColorTypeResultGraph';
import { VColorTypeResultGraph } from './VColorTypeResultGraph';
import {
  parseAnswerData,
  parseGraphData,
  parseNodePositionData,
} from '../functions/GraphDataFunctions';
import { appendNodeData } from '../functions/GraphFunctions';
import { usePlatform } from '../platform/PlatformContext';

// 出力結果ウインドウを表す関数コンポーネントを定義します。
export const ResultWindow = () => {
  // プラットフォーム API を取得します。
  const platform = usePlatform();
  // グラフの要素データを保持する状態変数を取得します
  const [elementData, setElementData] = useState<ElementDefinition[]>([]);
  // ノードの位置を保持する状態変数を取得します
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);
  // 解答データのインデックスを保持する状態変数を取得します
  const [anwerIndex, setAnswerIndex] = useState<number>(0);
  // 解答データを保持する状態変数を取得します
  const [answerData, setAnswerData] = useState<AnswerData>([]);
  // 解答データを表す文字列を保持する状態変数を取得します
  const [answerStr, setAnswerStr] = useState<string>('');
  // ソルバーが成功したかどうかのフラグを保持する状態変数を取得します
  const [succeeded, setSucceeded] = useState<boolean>(false);
  // 問題タイプを保持する状態変数を取得します
  const [problemType, setProblemType] = useState<string>('');
  // グラフのスタイル シートを保持する状態変数を取得します
  const [stylesheet, setStylesheet] = useState<Stylesheet[]>([]);
  // 彩色問題における色数を保持する状態変数を取得します。
  const [numColors, setNumColors] = useState<number>(-1);

  // 解答データ受け取り時の処理を設定します。
  useLayoutEffect(() => {
    platform.onDataSend(
      (
        event: any,
        graphData: string,
        nodePositionData: string,
        result: string,
        problemTypeInResult: string,
        stylesheet: Stylesheet[],
        numColors: number,
      ) => {
        // 受け取った解答データを保存します。
        setAnswerStr(result);
        let [elementDataInResult] = [[{ data: {} }], ['']];
        // 受け取った文字列からグラフ データを復元します。
        [elementDataInResult] = parseGraphData(graphData, problemTypeInResult);
        // 受け取った文字列からノードの位置情データを復元します。
        const nodePositionsInResult = parseNodePositionData(nodePositionData);
        appendNodeData(elementDataInResult, nodePositionsInResult);
        // グラフ データを保存します。
        setElementData(elementDataInResult);
        // ノード位置データを保存します。
        setNodePositions(nodePositionsInResult);
        // 受け取った文字列から解データと成功フラグを復元します。
        let [answerDataInResult, successFlagInResult] = parseAnswerData(result);
        if (result.trim() === 'not-found') successFlagInResult = false;
        // 解データを保存します。
        setAnswerData(answerDataInResult);
        // 成功フラグを保存します。
        setSucceeded(successFlagInResult);
        // 問題タイプを保存します。
        setProblemType(problemTypeInResult);
        // スタイル シートを保存します。
        setStylesheet(stylesheet);
        // 色数を保存します。
        setNumColors(numColors);
      },
    );
  }, []);

  // Next ボタン押下時のハンドラを取得します。
  const stepNext = () => {
    // 遷移ステップを 1 つ次に進めます。
    const next = anwerIndex + 1;
    if (next < answerData.length) {
      setAnswerIndex(next);
    }
  };

  // Previous ボタン押下時のハンドラを取得します。
  const stepPrevious = () => {
    // 遷移ステップを 1 つ前に進めます。
    const previous = anwerIndex - 1;
    if (previous >= 0) {
      setAnswerIndex(previous);
    }
  };

  // 解答データを表す文字列を取得します。
  const curAnswer = answerData.length === 0 ? [] : answerData[anwerIndex];

  // ソルバーの実行結果を表す文字列を取得します。
  const resultStr = succeeded
    ? `最短遷移 : ${Math.max(answerData.length - 1, 0)} ステップ`
    : '遷移不可';
  const curStepStr = `${anwerIndex}/${Math.max(answerData.length - 1, 0)}`;

  // 出力結果ウインドウを表す要素を作成します。
  return (
    <div css={container}>
      <div css={resultGraphCss}>
        <div> {resultStr} </div>
        {/* 頂点タイプの場合の出力結果グラフを表す要素です。 */}
        {problemType === 'vertex' && (
          <ResultGraph
            elements={elementData}
            nodePositions={nodePositions}
            answer={curAnswer}
            stylesheet={stylesheet}
            setElements={setElementData}
          />
        )}
        {/* 辺タイプの場合の出力結果グラフを表す要素です。 */}
        {problemType === 'edge' && (
          <EdgeTypeResultGraph
            elements={elementData}
            nodePositions={nodePositions}
            answer={curAnswer}
            stylesheet={stylesheet}
            setElements={setElementData}
          />
        )}
        {/* 頂点彩色タイプの場合の出力結果グラフを表す要素です。 */}
        {problemType === 'vcolor' && (
          <VColorTypeResultGraph
            elements={elementData}
            nodePositions={nodePositions}
            answer={curAnswer}
            stylesheet={stylesheet}
            setElements={setElementData}
            numColors={numColors}
          />
        )}
        {/* 辺彩色タイプの場合の出力結果グラフを表す要素です。 */}
        {problemType === 'ecolor' && (
          <EColorTypeResultGraph
            elements={elementData}
            nodePositions={nodePositions}
            answer={curAnswer}
            stylesheet={stylesheet}
            setElements={setElementData}
            numColors={numColors}
          />
        )}
        {problemType === '' && (
          <div style={{ width: '85%', height: '85%' }}></div>
        )}
        <div css={buttonsCss}>
          {/* Previous ボタンを表す要素です。 */}
          <Button variant="outlined" size="small" onClick={stepPrevious}>
            Previous
          </Button>
          {/* ステップ表示部を表す要素です。 */}
          <div> {curStepStr} </div>
          {/* Next ボタンを表す要素です。 */}
          <Button variant="outlined" size="small" onClick={stepNext}>
            Next
          </Button>
        </div>
      </div>
      {/* 解データ表示部を表す要素です。 */}
      <div css={resultTextCss}>
        <TextField
          label="最短遷移列"
          multiline
          rows={15}
          value={answerStr}
          sx={{ width: '90%', height: 'auto' }}
        />
      </div>
    </div>
  );
};

// 出力結果ウィンドウ全体のスタイル定義です。
const container = css`
  display: grid;
  grid-template-columns: 8fr 2fr;
  height: 100%;
  width: 100%;
`;

// 結果グラフ表示部のスタイル定義です。
const resultGraphCss = css`
  grid-column-start: 1;
  grid-column-end: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

// ボタン配置およびステップ数表示部のスタイル定義です。
const buttonsCss = css`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 50%;
`;

// 結果テキスト表示部のスタイル定義です。
const resultTextCss = css`
  grid-column-start: 2;
  grid-column-end: 3;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;
