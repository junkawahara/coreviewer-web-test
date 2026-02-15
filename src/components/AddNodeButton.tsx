import React, { Dispatch, useCallback, useEffect } from 'react';
import Button from '@mui/material/Button';

/**
 * 「ノードの追加」ボタンのコンポーネントのプロパティを表す型です。
 */
type AddNodeButtonProps = {
  // 無効化されているかどうかを表すフラグです。
  disabled: boolean;
  // ノード追加モードの有効/無効を表すフラグです。
  isAddingNodeMode: boolean;
  // ノード追加モードのフラグを設定するための関数です。
  setIsAddingNodeMode: Dispatch<any>;
};

// 「ノードの追加」ボタンを表す関数コンポーネントを定義します。
export const AddNodeButton = (props: AddNodeButtonProps) => {
  // 引数から各プロパティを取得します。
  const { disabled, isAddingNodeMode, setIsAddingNodeMode } = props;

  // ノード追加モードを切り替える関数を作成します。
  const toggleMode = useCallback(() => {
    setIsAddingNodeMode((curMode: any) => !curMode);
  }, []);

  // 無効化された場合の処理です。
  useEffect(() => {
    if (disabled) {
      setIsAddingNodeMode(false);
    }
  }, [disabled]);

  // 「ノードを追加」ボタンを表す要素を作成します。
  return (
    <Button
      disabled={disabled}
      onClick={toggleMode}
      sx={{
        height: '35px',
        width: '55px',
        fontSize: '10px',
        color: isAddingNodeMode ? '#fff' : '#000',
        backgroundColor: isAddingNodeMode ? '#FF6928' : '#ffffff',
        opacity: disabled ? 0.5 : 1,
        border: 'outset',
        translate: isAddingNodeMode ? 'translate(0,3px)' : 'none',
        borderBottom: isAddingNodeMode ? 'none' : 'outeset',
        borderRight: isAddingNodeMode ? 'none' : 'outeset',
        ':active': {
          transform: 'translate(0,3px)',
          borderBottom: 'none',
        },
      }}>
      {isAddingNodeMode ? 'Adding' : 'Add'}
    </Button>
  );
};
