import React, { Dispatch, useCallback, useEffect } from 'react';
import Button from '@mui/material/Button';

/**
 *  中央へ移動ボタンのコンポーネントのプロパティを表す型です。
 */
type MoveToCenterButtonProps = {
  // グラフを中央へ移動するかどうかを表すフラグです。
  centeringFlag: boolean;
  // グラフを中央へ移動するかどうかを表すフラグを設定する関数です。
  setCenteringFlag: Dispatch<any>;
  // ボタンが無効化されているかどうかを表すフラグです。
  disabled: boolean;
};

// 中央へ移動ボタンを表す関数コンポーネントを定義します
export const MoveToCenterButton = (props: MoveToCenterButtonProps) => {
  // 引数から各プロパティを取得します。
  const { centeringFlag, setCenteringFlag, disabled } = props;

  // グラフを中央へ移動するかどうかを表すフラグを変更します。
  useEffect(() => {
    if (centeringFlag) {
      setCenteringFlag(false);
    }
  }, [centeringFlag]);

  // ボタンが押された場合のハンドラを作成します。
  const onMoveToCenterButtonClicked = useCallback(() => {
    // グラフを中央へ移動するかどうかを表すフラグを true にします。
    setCenteringFlag(true);
  }, []);

  // 中央へ移動ボタンを表す要素を作成します。
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
        border: 'outset',
        opacity: disabled ? 0.5 : 1,
        ':active': {
          transform: 'translate(0,3px)',
          borderBottom: 'none',
        },
      }}>
      Center
    </Button>
  );
};
