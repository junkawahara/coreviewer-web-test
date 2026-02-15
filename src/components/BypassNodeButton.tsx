import React, { Dispatch, useCallback, useEffect } from 'react';
import Button from '@mui/material/Button';

/**
 * ノードの短絡ボタン コンポーネントのプロパティを表す型です。
 */
type BypassNodeButtonProps = {
  // 無効化されているかどうかを表すフラグです。
  disabled: boolean;
  // ノード短絡モードの有効/無効を表すフラグです。
  isBypassingNodeMode: boolean;
  // ノード短絡モードのフラグを設定するための関数です。
  setIsBypassingNodeMode: Dispatch<any>;
};

// ノードの短絡ボタンを表す関数コンポーネントを定義します。
export const BypassNodeButton = (props: BypassNodeButtonProps) => {
  // 引数から各プロパティを取得します。
  const { disabled, isBypassingNodeMode, setIsBypassingNodeMode } = props;

  // ノード短絡モードを切り替える関数を作成します。
  const toggleMode = useCallback(() => {
    setIsBypassingNodeMode((curMode: any) => !curMode);
  }, []);

  // 無効化された場合の処理です。
  useEffect(() => {
    if (disabled) {
      setIsBypassingNodeMode(false);
    }
  }, [disabled]);

  // ノードの細分ボタンを表す要素を作成します。
  return (
    <Button
      disabled={disabled}
      onClick={toggleMode}
      sx={{
        height: '35px',
        width: '55px',
        fontSize: '10px',
        color: isBypassingNodeMode ? '#fff' : '#000',
        backgroundColor: isBypassingNodeMode ? '#FF6928' : '#ffffff',
        opacity: disabled ? 0.5 : 1,
        border: 'outset',
        translate: isBypassingNodeMode ? 'translate(0,3px)' : 'none',
        borderBottom: isBypassingNodeMode ? 'none' : 'outeset',
        borderRight: isBypassingNodeMode ? 'none' : 'outeset',
        ':active': {
          transform: 'translate(0,3px)',
          borderBottom: 'none',
        },
      }}>
      {isBypassingNodeMode ? 'Bypassing' : 'Bypass'}
    </Button>
  );
};
