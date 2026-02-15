import React, { Dispatch, useCallback, useEffect } from 'react';
import Button from '@mui/material/Button';

/**
 * ノードの細分ボタン コンポーネントのプロパティを表す型です。
 */
type SubdivideNodeButtonProps = {
  // 無効化されているかどうかを表すフラグです。
  disabled: boolean;
  // ノード細分モードの有効/無効を表すフラグです。
  isSubdividingNodeMode: boolean;
  // ノード細分モードのフラグを設定するための関数です。
  setIsSubdividingNodeMode: Dispatch<any>;
};

// ノードの細分ボタンを表す関数コンポーネントを定義します。
export const SubdivideNodeButton = (props: SubdivideNodeButtonProps) => {
  // 引数から各プロパティを取得します。
  const { disabled, isSubdividingNodeMode, setIsSubdividingNodeMode } = props;

  // ノード細分モードを切り替える関数を作成します。
  const toggleMode = useCallback(() => {
    setIsSubdividingNodeMode((curMode: any) => !curMode);
  }, []);

  // 無効化された場合の処理です。
  useEffect(() => {
    if (disabled) {
      setIsSubdividingNodeMode(false);
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
        color: isSubdividingNodeMode ? '#fff' : '#000',
        backgroundColor: isSubdividingNodeMode ? '#FF6928' : '#ffffff',
        opacity: disabled ? 0.5 : 1,
        border: 'outset',
        translate: isSubdividingNodeMode ? 'translate(0,3px)' : 'none',
        borderBottom: isSubdividingNodeMode ? 'none' : 'outeset',
        borderRight: isSubdividingNodeMode ? 'none' : 'outeset',
        ':active': {
          transform: 'translate(0,3px)',
          borderBottom: 'none',
        },
      }}>
      {isSubdividingNodeMode ? 'Subdividing' : 'Subdivide'}
    </Button>
  );
};
