import React, { Dispatch, useCallback, useEffect } from 'react';
import Button from '@mui/material/Button';

/**
 * ノード削除ボタンのコンポーネントのプロパティを表す型です。
 */
type RemoveNodeButtonProps = {
  // 無効化されているかどうかを表すフラグです。
  disabled: boolean;
  // ノードを削除するかどうかを表すフラグです。
  nodeRemovingFlag: boolean;
  // ノードを削除するかどうかを表すフラグの設定用関数です。
  setNodeRemovingFlag: Dispatch<any>;
};

// ノード削除ボタンを表す関数コンポーネントを定義します。
export const RemoveNodeButton = (props: RemoveNodeButtonProps) => {
  // 引数から各プロパティを取得します
  const { disabled, nodeRemovingFlag, setNodeRemovingFlag } = props;

  // ノード削除フラグ変更時の処理です。
  useEffect(() => {
    // 現在のフラグ値が true の場合は、値を false に戻します。
    if (nodeRemovingFlag) {
      setNodeRemovingFlag(false);
    }
  }, [nodeRemovingFlag]);

  // ボタンが押された場合のハンドラを作成します。
  const onMoveToCenterButtonClicked = useCallback(() => {
    // ノード削除フラグを true に設定します。
    setNodeRemovingFlag(true);
  }, []);

  // ノード削除ボタンを表す要素を作成します。
  return (
    <Button
      disabled={disabled}
      onClick={onMoveToCenterButtonClicked}
      sx={{
        height: '35px',
        width: '55px',
        fontSize: '10px',
        color: '#000',
        backgroundColor: '#ffffff',
        opacity: disabled ? 0.5 : 1,
        border: 'outset',
        boxSizing: 'border-box',
        ':active': {
          transform: 'translate(0,3px)',
          borderBottom: 'none',
        },
      }}>
      Del
    </Button>
  );
};
