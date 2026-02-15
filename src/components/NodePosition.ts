// ノードの位置に関する情報を保持する型です。
export type NodePosition = {
  // ノードの ID です。
  id: string;

  // ノードの x 座標値です。
  x: number | undefined;

  // ノードの y 座標値です。
  y: number | undefined;

  // ノードが開始位置に指定されているかどうかのフラグです。
  isStart: boolean;

  // ノードが目標位置に指定されているかどうかのフラグです。
  isTarget: boolean;

  // ノードが選択されているかどうかを表すフラグです。
  isSelected: boolean;
};

// ノードの位置情報のマップです。
// キーは組合せ遷移問題の表示名で、ノードの位置情報が値となります。
export type NodePositionMap = {
  [key: string]: NodePosition[];
};
