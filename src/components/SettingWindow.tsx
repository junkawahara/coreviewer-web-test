/** @jsxImportSource @emotion/react */

import React, { useCallback, useEffect, useState } from 'react';
import { css } from '@emotion/react';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { Settings, getDefaultSettings } from '../Settings';
import { ColorSelectionBox } from './ColorSelectionBox';

// 設定ウインドウを表す関数コンポーネントを定義します。
export const SettingWindow = () => {
  // ソルバー名リストを保持する状態変数を取得します。
  const [solvers, setSolvers] = useState<string[]>([]);
  // ソルバーの設定値を保持する状態変数を取得します。
  const [solver, setSolver] = useState<string>('');
  // ノードの半径を保持する状態変数を取得します。
  const [nodeRadius, setNodeRadius] = useState<number>(1);
  // ノードの枠幅を保持する状態変数を取得します。
  const [nodeBorderWidth, setNodeBorderWidth] = useState<number>(1);
  // ノードの通常色を保持する状態変数を取得します。
  const [normalNodeColor, setNormalNodeColor] = useState<string>('');
  // 開始集合に属するノードの色を保持する状態変数を取得します。
  const [startNodeColor, setStartNodeColor] = useState<string>('');
  // 目標集合に属するノードの色を保持する状態変数を取得します。
  const [targetNodeColor, setTargetNodeColor] = useState<string>('');
  // 解答中の遷移ステップに含まれるノードの色を保持する状態変数を取得します。
  const [answerNodeColor, setAnswerNodeColor] = useState<string>('');
  // ノード枠線の色を保持する状態変数を取得します。
  const [nodeBorderColor, setNodeBorderColor] = useState<string>('');
  // ノードのラベルの表示/非表示フラグを保持する状態変数を取得します。
  const [displayNodeLabel, setDisplayNodeLabel] = useState<boolean>(true);
  // エッジの幅を保持する状態変数を取得します。
  const [edgeWidth, setEdgeWidth] = useState<number>(1);
  // エッジの通常色を保持する状態変数を取得します。
  const [normalEdgeColor, setNormalEdgeColor] = useState<string>('');
  // 開始集合に属するエッジの色を保持する状態変数を取得します。
  const [startEdgeColor, setStartEdgeColor] = useState<string>('');
  // 目標集合に属するエッジの色を保持する状態変数を取得します。
  const [targetEdgeColor, setTargetEdgeColor] = useState<string>('');
  // 解答中の遷移ステップに含まれるエッジの色を保持する状態変数を取得します。
  const [answerEdgeColor, setAnswerEdgeColor] = useState<string>('');
  // エッジのラベルの表示/非表示フラグを保持する状態変数を取得します。
  const [displayEdgeLabel, setDisplayEdgeLabel] = useState<boolean>(false);
  // 変更前の設定を保持する状態変数を取得します。
  const [origSetting, setOrigSetting] = useState<Settings>(
    getDefaultSettings(),
  );
  // ソルバー設定ダイアログのオーブン状態を保持する状態変数を取得します。
  const [open, setOpen] = useState(false);
  // 設定が変更されたかどうかを表すフラグを保持する状態変数を取得します。
  const [settingChanged, setSettingChanged] = useState<boolean>(false);

  // ウィンドウ表示時にメイン プロセスから設定を受け取るハンドラを設定します。
  useEffect(() => {
    window.apiData.onSettingsSend(
      (
        event: any,
        setting: Settings,
        solvers: string[],
        targetWindow: string,
      ) => {
        if (targetWindow === 'SettingWindow') {
          // 変更前の設定をステートに設定します。
          setOrigSetting(setting);
          // ソルバー名一覧をステートに設定します。
          setSolvers(solvers);
          // ソルバー名をステートに設定します。
          if (solvers.includes(setting.solver)) {
            setSolver(setting.solver);
          } else if (solvers.length > 0) {
            setSolver(solvers[0]);
          }
          // ノードの半径、幅、色をステートに設定します。
          setNodeRadius(setting.nodeRadius);
          setNodeBorderWidth(setting.nodeBorderWidth);
          setNormalNodeColor(setting.normalNodeColor);
          setStartNodeColor(setting.startNodeColor);
          setTargetNodeColor(setting.targetNodeColor);
          setAnswerNodeColor(setting.answerNodeColor);
          setNodeBorderColor(setting.nodeBorderColor);
          setDisplayNodeLabel(setting.displayNodeLabel);
          // エッジの幅、色をステートに設定します。
          setEdgeWidth(setting.edgeWidth);
          setNormalEdgeColor(setting.normalEdgeColor);
          setStartEdgeColor(setting.startEdgeColor);
          setTargetEdgeColor(setting.targetEdgeColor);
          setAnswerEdgeColor(setting.answerEdgeColor);
          setDisplayEdgeLabel(setting.displayEdgeLabel);
        }
      },
    );
  }, []);

  // 設定変更時の処理です。保存ボタンの有効/無効を決定します。
  useEffect(() => {
    let changed = false;
    if (origSetting.solver != solver) {
      changed = true;
    }
    if (origSetting.nodeRadius != nodeRadius) {
      changed = true;
    }
    if (origSetting.nodeBorderWidth != nodeBorderWidth) {
      changed = true;
    }
    if (origSetting.normalNodeColor != normalNodeColor) {
      changed = true;
    }
    if (origSetting.startNodeColor != startNodeColor) {
      changed = true;
    }
    if (origSetting.targetNodeColor != targetNodeColor) {
      changed = true;
    }
    if (origSetting.answerNodeColor != answerNodeColor) {
      changed = true;
    }
    if (origSetting.nodeBorderColor != nodeBorderColor) {
      changed = true;
    }
    if (origSetting.displayNodeLabel != displayNodeLabel) {
      changed = true;
    }
    if (origSetting.edgeWidth != edgeWidth) {
      changed = true;
    }
    if (origSetting.normalEdgeColor != normalEdgeColor) {
      changed = true;
    }
    if (origSetting.startEdgeColor != startEdgeColor) {
      changed = true;
    }
    if (origSetting.targetEdgeColor != targetEdgeColor) {
      changed = true;
    }
    if (origSetting.answerEdgeColor != answerEdgeColor) {
      changed = true;
    }
    if (origSetting.displayEdgeLabel != displayEdgeLabel) {
      changed = true;
    }
    setSettingChanged(changed);
  }, [
    solver,
    nodeRadius,
    nodeBorderWidth,
    normalNodeColor,
    startNodeColor,
    targetNodeColor,
    answerNodeColor,
    nodeBorderColor,
    displayNodeLabel,
    edgeWidth,
    normalEdgeColor,
    startEdgeColor,
    targetEdgeColor,
    answerEdgeColor,
    displayEdgeLabel,
  ]);

  // ソルバー選択時の処理を行うハンドラを作成します。
  const handleSolverChange = useCallback((event: any) => {
    setSolver(event.target.value);
  }, []);

  // ノードの半径選択時の処理を行うハンドラを作成します。
  const handleNodeRadiusChange = useCallback((event: any) => {
    setNodeRadius(event.target.value);
  }, []);

  // ノードの枠幅選択時の処理を行うハンドラを作成します。
  const handleNodeBorderWidthChange = useCallback((event: any) => {
    setNodeBorderWidth(event.target.value);
  }, []);

  // 選択ボックスのオープン時、およびクローズ時の処理を行うハンドラを作成します。
  const onClosed = useCallback(() => {
    setOpen(false);
  }, []);
  const onOpened = useCallback(() => {
    setOpen(true);
  }, []);

  // 保存ボタンクリック時のハンドラを作成します。
  const onSaving = useCallback(() => {
    // 保存する設定オブジェクトを作成します。
    const newSetting: Settings = {
      solver,
      nodeRadius,
      nodeBorderWidth,
      normalNodeColor,
      startNodeColor,
      targetNodeColor,
      answerNodeColor,
      nodeBorderColor,
      displayNodeLabel,
      edgeWidth,
      normalEdgeColor,
      startEdgeColor,
      targetEdgeColor,
      answerEdgeColor,
      displayEdgeLabel,
    };
    // 作成した設定オブジェクトをメイン プロセスに送信します。
    window.apiData.saveSetting(newSetting);
    // ウィンドウを閉じます。
    window.close();
  }, [
    solver,
    nodeRadius,
    nodeBorderWidth,
    normalNodeColor,
    startNodeColor,
    targetNodeColor,
    answerNodeColor,
    nodeBorderColor,
    displayNodeLabel,
    edgeWidth,
    normalEdgeColor,
    startEdgeColor,
    targetEdgeColor,
    answerEdgeColor,
    displayEdgeLabel,
  ]);

  // 設定ウィンドウを表す要素を作成します。
  return (
    <div css={container}>
      {/* ソルバー設定部を表す要素です。 */}
      <fieldset css={solverSettingGroupCss}>
        <legend>Solver Setting</legend>
        <div css={solverSettingContainerCss}>
          <div css={solverSelectPartCss}>
            <div style={{ flexShrink: 0, width: '150px' }}>Solver: </div>
            <Select
              sx={{ width: '100%' }}
              id="solver_selector"
              autoWidth={false}
              value={solver}
              onOpen={onOpened}
              onClose={onClosed}
              onChange={handleSolverChange}
              open={open}>
              {solvers.map(solver => {
                return (
                  <MenuItem key={solver} value={solver}>
                    {solver}
                  </MenuItem>
                );
              })}
            </Select>
          </div>
        </div>
      </fieldset>
      {/* ノード表示設定部を表す要素です。 */}
      <fieldset css={nodeDisplaySettingGroupCss}>
        <legend>Node Setting</legend>
        <div css={nodeDisplaySettingContainerCss}>
          {/* ノードの半径設定部を表す要素です。 */}
          <div css={nodeRadiusSelectPartCss}>
            <div style={{ flexShrink: 0, width: '130px' }}>Radius: </div>
            <input
              type="number"
              value={nodeRadius}
              min={1}
              css={nodeRadiusSelectBoxCss}
              onChange={handleNodeRadiusChange}></input>
          </div>
          {/* ノードの枠幅設定部を表す要素です。 */}
          <div css={nodeBorderWidthSelectPartCss}>
            <div style={{ flexShrink: 0, width: '130px' }}>Border Width: </div>
            <input
              type="number"
              value={nodeBorderWidth}
              min={1}
              css={nodeBorderWidthSelectCss}
              onChange={handleNodeBorderWidthChange}></input>
          </div>
          {/* ノードの通常色設定部を表す要素です。 */}
          <div css={nodeNormalColorSelectPartCss}>
            <div style={{ flexShrink: 0, width: '150px' }}>Normal Color: </div>
            <ColorSelectionBox
              colorValue={normalNodeColor}
              changeHandler={event => {
                setNormalNodeColor(event.target.value);
              }}></ColorSelectionBox>
          </div>
          {/* 開始集合に属するノードの色設定部を表す要素です。 */}
          <div css={startNodeColorSelectPartCss}>
            <div style={{ flexShrink: 0, width: '150px' }}>Start Color: </div>
            <ColorSelectionBox
              colorValue={startNodeColor}
              changeHandler={event => {
                setStartNodeColor(event.target.value);
              }}></ColorSelectionBox>
          </div>
          {/* 目標集合に属するノードの色設定部を表す要素です。 */}
          <div css={targetNodeColorSelectPartCss}>
            <div style={{ flexShrink: 0, width: '150px' }}>Target Color: </div>
            <ColorSelectionBox
              colorValue={targetNodeColor}
              changeHandler={event => {
                setTargetNodeColor(event.target.value);
              }}></ColorSelectionBox>
          </div>
          {/* 解答中の遷移ステップに含まれるノードの色の設定部を表す要素です。 */}
          <div css={answerNodeColorSelectPartCss}>
            <div style={{ flexShrink: 0, width: '150px' }}>Answer Color: </div>
            <ColorSelectionBox
              colorValue={answerNodeColor}
              changeHandler={event => {
                setAnswerNodeColor(event.target.value);
              }}></ColorSelectionBox>
          </div>
          {/* ノードの枠線の色設定部を表す要素です。 */}
          <div css={nodeBorderColorSelectPartCss}>
            <div style={{ flexShrink: 0, width: '150px' }}>Border Color: </div>
            <ColorSelectionBox
              colorValue={nodeBorderColor}
              changeHandler={event => {
                setNodeBorderColor(event.target.value);
              }}></ColorSelectionBox>
          </div>
          {/* ノードのラベル表示設定部を表す要素です。 */}
          <div css={nodeLabelDsiplayPartCss}>
            <label>
              <input
                type="checkbox"
                checked={displayNodeLabel}
                onChange={event => {
                  setDisplayNodeLabel(event.target.checked);
                }}
              />
              Show Label
            </label>
          </div>
        </div>
      </fieldset>
      {/* エッジ表示設定部を表す要素です。 */}
      <fieldset css={edgeDisplaySettingGroupCss}>
        <legend>Edge Setting</legend>
        <div css={edgeDisplaySettingContainerCss}>
          {/* エッジの幅設定部を表す要素です。 */}
          <div css={edgeWidthSelectPartCss}>
            <div style={{ flexShrink: 0, width: '130px' }}>Width: </div>
            <input
              type="number"
              value={edgeWidth}
              min={1}
              css={edgeWidthSelectBoxCss}
              onChange={event => {
                setEdgeWidth(parseInt(event.target.value));
              }}></input>
          </div>
          {/* エッジの通常色設定部を表す要素です。 */}
          <div css={normalEdgeColorSelectPartCss}>
            <div style={{ flexShrink: 0, width: '150px' }}>Normal Color: </div>
            <ColorSelectionBox
              colorValue={normalEdgeColor}
              changeHandler={event => {
                setNormalEdgeColor(event.target.value);
              }}></ColorSelectionBox>
          </div>
          {/* 開始集合に属するエッジの色設定部を表す要素です。 */}
          <div css={startEdgeColorSelectPartCss}>
            <div style={{ flexShrink: 0, width: '150px' }}>Start Color: </div>
            <ColorSelectionBox
              colorValue={startEdgeColor}
              changeHandler={event => {
                setStartEdgeColor(event.target.value);
              }}></ColorSelectionBox>
          </div>
          {/* 目標集合に属するエッジの色設定部を表す要素です。 */}
          <div css={targetEdgeColorSelectPartCss}>
            <div style={{ flexShrink: 0, width: '150px' }}>Target Color: </div>
            <ColorSelectionBox
              colorValue={targetEdgeColor}
              changeHandler={event => {
                setTargetEdgeColor(event.target.value);
              }}></ColorSelectionBox>
          </div>
          {/* 解答中の遷移ステップに含まれるエッジの色設定部を表す要素です。 */}
          <div css={answerEdgeColorSelectPartCss}>
            <div style={{ flexShrink: 0, width: '150px' }}>Answer Color: </div>
            <ColorSelectionBox
              colorValue={answerEdgeColor}
              changeHandler={event => {
                setAnswerEdgeColor(event.target.value);
              }}></ColorSelectionBox>
          </div>
          {/* エッジのラベル表示設定部を表す要素です。 */}
          <div css={edgeLabelDsiplayPartCss}>
            <label>
              <input
                type="checkbox"
                checked={displayEdgeLabel}
                onChange={event => {
                  setDisplayEdgeLabel(event.target.checked);
                }}
              />
              Show Label
            </label>
          </div>
        </div>
      </fieldset>
      <div css={buttonContainer}>
        {/* 保存ボタンを表す要素です。 */}
        <Button
          variant="outlined"
          css={saveButtonCss}
          disabled={!settingChanged}
          onClick={onSaving}>
          Save
        </Button>
        {/* キャンセル ボタンを表す要素です。 */}
        <Button
          variant="outlined"
          css={cancelButtonCss}
          onClick={() => {
            window.close();
          }}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

// 設定ウィンドウ全体のスタイル定義です。
const container = css`
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 1fr 4fr 3fr 40px;
  width: 91vw;
  height: 91vh;
  column-gap: 0px;
  row-gap: 0px;
  // border: solid 5px #ffaabb;
`;

const solverSettingGroupCss = css`
  grid-row-start: 1;
  grid-row-end: 2;
  // border: solid 5px #ffff00;
`;

const solverSettingContainerCss = css`
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 100%;
  // border: solid 5px #ffffff;
`;

// ソルバー選択部のスタイル定義です。
const solverSelectPartCss = css`
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 1;
  grid-row-end: 2;
  justify-self: stretch;
  //align-self: center;
  // border: solid 5px #ff0000;
  display: flex;
  align-items: center;
`;

// ソルバー選択ボックスのスタイル定義です。
const solverSelectBoxCss = css`
  //justify-self: stretch;
  //align-self: center;
  // border: solid 5px #ffff00;
`;

// 表示設定部のスタイル定義です。
const displaySettingGroupCss = css`
  grid-row-start: 2;
  grid-row-end: 9;
  // border: solid 5px #ffff00;
  padding: 0;
  display: grid
  grid-template-columns: 100%;
  grid-template-rows: 4fr 3fr
`;

// ノードの表示部のスタイル定義です。
const nodeDisplaySettingGroupCss = css`
  grid-row-start: 2;
  grid-row-end: 5;
  // border: solid 5px #ff00ff;
`;

// ノードの表示部のコンテナのスタイル定義です。
const nodeDisplaySettingContainerCss = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  // border: solid 5px #ffffff;
`;

// ノードの半径選択部のスタイル定義です。
const nodeRadiusSelectPartCss = css`
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 1;
  grid-row-end: 2;
  justify-self: stretch;
  //align-self: center;
  display: flex;
  align-items: center;
  // border: solid 5px #ff0000;
`;

// ノードの半径選択ボックスのスタイル定義です。
const nodeRadiusSelectBoxCss = css`
  align-self: stretch;
  margin-left: 20px;
  width: 75%;
`;

// ノードの枠線半径選択部のスタイル定義です。
const nodeBorderWidthSelectPartCss = css`
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 2;
  justify-self: stretch;
  //align-self: center;
  display: flex;
  align-items: center;
  // border: solid 5px #ff0000;
`;

// ノードの枠幅選択ボックスのスタイル定義です。
const nodeBorderWidthSelectCss = css`
  align-self: stretch;
  align-self: stretch;
  margin-left: 20px;
  width: 75%;
`;

// ノードの通常色選択部のスタイル定義です。
const nodeNormalColorSelectPartCss = css`
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 2;
  grid-row-end: 3;
  justify-self: stretch;
  //align-self: center;
  display: flex;
  align-items: center;
  // border: solid 5px #ff0000;
`;

// 開始集合に含まれるノードの色選択部のスタイル定義です。
const startNodeColorSelectPartCss = css`
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 3;
  justify-self: stretch;
  display: flex;
  align-items: center;
  // border: solid 5px #ff0000;
`;

// 目標集合に含まれるノードの色選択部のスタイル定義です。
const targetNodeColorSelectPartCss = css`
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 3;
  grid-row-end: 4;
  justify-self: stretch;
  //align-self: center;
  display: flex;
  align-items: center;
  // border: solid 5px #ff0000;
`;

// 解答中の遷移ステップに含まれるノードの枠色選択部のスタイル定義です。
const answerNodeColorSelectPartCss = css`
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 3;
  grid-row-end: 4;
  justify-self: stretch;
  //align-self: center;
  display: flex;
  align-items: center;
  // border: solid 5px #ff0000;
`;

// ノードの枠色選択部のスタイル定義です。
const nodeBorderColorSelectPartCss = css`
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 4;
  grid-row-end: 5;
  justify-self: stretch;
  //align-self: center;
  display: flex;
  align-items: center;
  // border: solid 5px #ff0000;
`;

// ノードのラベル表示選択部のスタイル定義です。
const nodeLabelDsiplayPartCss = css`
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 4;
  grid-row-end: 5;
  justify-self: stretch;
  //align-self: center;
  display: flex;
  align-items: center;
  // border: solid 5px #ff0000;
`;

// エッジ表示設定部のスタイルです。
const edgeDisplaySettingGroupCss = css`
  grid-row-start: 5;
  grid-row-end: 8;
  // border: solid 5px #ff00ff;
`;

// エッジ表示設定部のコンテナのスタイル定義です。
const edgeDisplaySettingContainerCss = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  // border: solid 5px #ffffff;
`;

// エッジの幅設定部のスタイルです。
const edgeWidthSelectPartCss = css`
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 1;
  grid-row-end: 2;
  justify-self: stretch;
  //align-self: center;
  display: flex;
  align-items: center;
  // border: solid 5px #ff0000;
`;

// エッジの通常色設定部のスタイルです。
const normalEdgeColorSelectPartCss = css`
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 2;
  justify-self: stretch;
  //align-self: center;
  display: flex;
  align-items: center;
  // border: solid 5px #ff0000;
`;

// 開始集合に属するエッジの色設定部のスタイルです。
const startEdgeColorSelectPartCss = css`
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 2;
  grid-row-end: 3;
  justify-self: stretch;
  //align-self: center;
  display: flex;
  align-items: center;
  // border: solid 5px #ff0000;
`;

// 目標集合に属するエッジの色設定部のスタイルです。
const targetEdgeColorSelectPartCss = css`
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 3;
  justify-self: stretch;
  //align-self: center;
  display: flex;
  align-items: center;
  // border: solid 5px #ff0000;
`;

// 解答中の遷移ステップに含まれるエッジの色設定部のスタイルです。
const answerEdgeColorSelectPartCss = css`
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 3;
  grid-row-end: 4;
  justify-self: stretch;
  //align-self: center;
  display: flex;
  align-items: center;
  // border: solid 5px #ff0000;
`;

// エッジの表示/非表示を設定する部分のスタイルです。
const edgeLabelDsiplayPartCss = css`
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 3;
  grid-row-end: 4;
  justify-self: stretch;
  //align-self: center;
  display: flex;
  align-items: center;
  // border: solid 5px #ff0000;
`;

// エッジの幅選択ボックスのスタイルです。
const edgeWidthSelectBoxCss = css`
  align-self: stretch;
  margin-left: 20px;
  width: 75%;
`;

// ボタン配置部のスタイル定義です。
const buttonContainer = css`
  grid-row-start: 8;
  grid-row-end: 9;
  display: flex;
  justify-content: end;
`;

// 保存ボタンのスタイル定義です。
const saveButtonCss = css`
  width: 100px;
  margin: 1px 3px;
  //  border: solid 5px #ff0000;
`;

// キャンセル ボタンのスタイル定義です。
const cancelButtonCss = css`
  width: 100px;
  margin: 1px 3px;
  //  border: solid 5px #ff0000;
`;
