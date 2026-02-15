/** @jsxImportSource @emotion/react */

import React, { Dispatch, useLayoutEffect, useEffect, useMemo } from 'react';
import { css } from '@emotion/react';

import { AddNodeButton } from './AddNodeButton';
import { BypassNodeButton } from './BypassNodeButton';
import { ColorNumberSelectionBox } from './ColorNumberSelectionBox';
import { MoveToCenterButton } from './MoveToCenterButton';
import { RemoveNodeButton } from './RemoveNodeButton';
import { SubdivideNodeButton } from './SubdivideNodeButton';

/**
 * ボタン パレット コンポーネントのプロパティを表す型です。
 */
type ButtonPaletteProps = {
  // ノード追加モードの有効/無効を表すフラグです。
  isAddingNodeMode: boolean;
  // ノード追加モードの有効/無効を表すフラグを設定する関数です。
  setIsAddingNodeMode: Dispatch<boolean>;
  // ノード細分モードの有効/無効を表すフラグです。
  isSubdividingNodeMode: boolean;
  // ノード細分モードの有効/無効を表すフラグを設定する関数です。
  setIsSubdividingNodeMode: Dispatch<boolean>;
  // ノード短絡モードの有効/無効を表すフラグです。
  isBypassingNodeMode: boolean;
  // ノード短絡モードの有効/無効を表すフラグを設定する関数です。
  setIsBypassingNodeMode: Dispatch<boolean>;
  // 編集モードの有効/無効を表す関数です。
  isEditMode: boolean;
  // グラフを中央に移動するかどうかを表すフラグです。
  centeringFlag: boolean;
  // グラフを中央に移動するかどうかを表すフラグを設定する関数です。
  setCenteringFlag: Dispatch<boolean>;
  // ボタン パレットを無効化するかどうかを表すフラグです。
  disabled: boolean;
  // ノードを除去するかどうかを表すフラグです。
  nodeRemovingFlag: boolean;
  // ノードを除去するかどうかを表すフラグを設定する関数です。
  setNodeRemovingFlag: Dispatch<boolean>;
};

// ボタン パレットを表す関数コンポーネントを定義します。
export const ButtonPalette = (props: ButtonPaletteProps) => {
  // 引数から各プロパティを取得します。
  const {
    isAddingNodeMode,
    setIsAddingNodeMode,
    isSubdividingNodeMode,
    setIsSubdividingNodeMode,
    isBypassingNodeMode,
    setIsBypassingNodeMode,
    isEditMode,
    centeringFlag,
    disabled,
    setCenteringFlag,
    nodeRemovingFlag,
    setNodeRemovingFlag,
  } = props;

  // // ノード追加ボタンを無効化するかどうかを表すフラグを取得します。
  // const disableAddNodeButton = useMemo(() => {
  //   return !isEditMode || isSubdividingNodeMode || isBypassingNodeMode;
  // }, [isAddingNodeMode]);

  // // ノード細分ボタンを無効化するかどうかを表すフラグを取得します。
  // const disableSubdividingNodeButton = useMemo(() => {
  //   return !isEditMode || isAddingNodeMode || isBypassingNodeMode;
  // }, [isEditMode, isAddingNodeMode, isBypassingNodeMode]);

  // // ノード短絡ボタンを無効化するかどうかを表すフラグを取得します。
  // const disableBypassNodeButton = useMemo(() => {
  //   return !isEditMode || isAddingNodeMode || isSubdividingNodeMode;
  // }, [isEditMode, isAddingNodeMode, isSubdividingNodeMode]);

  useEffect(() => {
    if (isSubdividingNodeMode || isBypassingNodeMode) {
      setIsAddingNodeMode(false);
    }
  }, [isSubdividingNodeMode, isBypassingNodeMode]);

  useEffect(() => {
    if (isAddingNodeMode || isBypassingNodeMode) {
      setIsSubdividingNodeMode(false);
    }
  }, [isAddingNodeMode, isBypassingNodeMode]);

  useEffect(() => {
    if (isAddingNodeMode || isSubdividingNodeMode) {
      setIsBypassingNodeMode(false);
    }
  }, [isAddingNodeMode, isSubdividingNodeMode]);

  // ボタン パレットを表す要素を作成します。
  return (
    <div style={{ width: '100%' }}>
      <div css={buttonPaletteCss}>
        {/* 中央へ移動ボタンを表す要素です。*/}
        <div css={moveToCenterButtonCss(false)}>
          <MoveToCenterButton
            disabled={disabled}
            centeringFlag={centeringFlag}
            setCenteringFlag={setCenteringFlag}
          />
        </div>
        {/* ノードの追加ボタンを表す要素です。*/}
        <div css={addNodeButtonCss(false)}>
          <AddNodeButton
            disabled={!isEditMode}
            isAddingNodeMode={isAddingNodeMode}
            setIsAddingNodeMode={setIsAddingNodeMode}
          />
        </div>
        {/* ノードの除去ボタンを表す要素です。*/}
        <div css={removeNodeButtonCss(false)}>
          <RemoveNodeButton
            disabled={!isEditMode}
            nodeRemovingFlag={nodeRemovingFlag}
            setNodeRemovingFlag={setNodeRemovingFlag}
          />
        </div>
        {/* ノードの細分ボタンを表す要素です。*/}
        <div css={subdivideNodeButtonCss(false)}>
          <SubdivideNodeButton
            disabled={!isEditMode}
            isSubdividingNodeMode={isSubdividingNodeMode}
            setIsSubdividingNodeMode={setIsSubdividingNodeMode}
          />
        </div>
        {/* ノードの短絡 ボタンを表す要素です。*/}
        <div css={bypassNodeButtonCss(false)}>
          <BypassNodeButton
            disabled={!isEditMode}
            isBypassingNodeMode={isBypassingNodeMode}
            setIsBypassingNodeMode={setIsBypassingNodeMode}
          />
        </div>
        {/* 色数選択ボックスを表す要素です。*/}
        <div css={colorNumberBoxCss(false)}>
          <ColorNumberSelectionBox />
        </div>
      </div>
    </div>
  );
};

// ボタン パレット全体のスタイル定義です。
const buttonPaletteCss = css`
  display: grid;
  grid-template-columns: 1px 1fr 1fr 1ft 1px;
  grid-template-rows: 1px 1fr 1fr 1fr 4fr 1px;
  column-gap: 1px;
  row-gap: 1px;
  border: solid 1px silver;
  border-radius: 5px;
  background-color: #fff;
  margin: auto;
  padding: 5px;
  width: 90%;
  justify-self: center;
`;

// 中央へ移動ボタンのスタイル定義です。
const moveToCenterButtonCss = (disabled: boolean) => css`
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 3;
  justify-self: center;
  align-self: center;
  opacity: ${disabled ? 0.5 : 1};
`;

// ノードの追加ボタンのスタイル定義です。
const addNodeButtonCss = (disabled: boolean) => css`
  grid-column-start: 3;
  grid-column-end: 4;
  grid-row-start: 2;
  grid-row-end: 3;
  justify-self: center;
  align-self: center;
  opacity: ${disabled ? 0.5 : 1};
`;

// ノードの除去ボタンのスタイル定義です。
const removeNodeButtonCss = (disabled: boolean) => css`
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 3;
  grid-row-end: 4;
  justify-self: center;
  align-self: center;
  opacity: ${disabled ? 0.5 : 1};
`;

// ノードの細分ボタンのスタイル定義です。
const subdivideNodeButtonCss = (disabled: boolean) => css`
  grid-column-start: 3;
  grid-column-end: 4;
  grid-row-start: 3;
  grid-row-end: 4;
  justify-self: center;
  align-self: center;
  opacity: ${disabled ? 0.5 : 1};
`;

// ノードの短絡ボタンのスタイル定義です。
const bypassNodeButtonCss = (disabled: boolean) => css`
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 4;
  grid-row-end: 5;
  justify-self: center;
  align-self: center;
  opacity: ${disabled ? 0.5 : 1};
`;

// 色数選択ボックスのスタイル定義です。
const colorNumberBoxCss = (disabled: boolean) => css`
  grid-column-start: 3;
  grid-column-end: 4;
  grid-row-start: 4;
  grid-row-end: 5;
  justify-self: center;
  align-self: center;
  opacity: ${disabled ? 0.5 : 1};
`;
