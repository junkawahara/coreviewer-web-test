// 内蔵ソルバーの名前定数です。
export const BUILTIN_SOLVER_NAME = 'IDA*（内蔵）';

/**
 * アプリケーションの設定を保持する型です。
 */
export type Settings = {
  // 使用するソルバーの名前です。
  solver: string;
  // ノードの半径 (px) です。
  nodeRadius: number;
  // ノードの枠線の幅 (px) です。
  nodeBorderWidth: number;
  // ノードの通常色です。
  normalNodeColor: string;
  // 開始集合に属するノードの色です。
  startNodeColor: string;
  // 目標集合に属するノードの色です。
  targetNodeColor: string;
  // 解答中の遷移ステップに含まれるノードの色です。
  answerNodeColor: string;
  // ノードの枠線の色です。
  nodeBorderColor: string;
  // ノードのラベルを表示するかどうかを表すフラグです。
  displayNodeLabel: boolean;
  // エッジの幅 (px) です。
  edgeWidth: number;
  // エッジの通常色です。
  normalEdgeColor: string;
  // 開始集合に属するエッジの色です。
  startEdgeColor: string;
  // 目標集合に属するエッジの色です。
  targetEdgeColor: string;
  // 解答中の遷移ステップに含まれるエッジの色です。
  answerEdgeColor: string;
  // エッジのラベルを表示するかどうかを表すフラグです。
  displayEdgeLabel: boolean;
};

/**
 *  デフォルトの設定を取得します。
 *  @return {Settings} デフォルトの設定値
 */
export function getDefaultSettings(): Settings {
  return {
    solver: BUILTIN_SOLVER_NAME,
    nodeRadius: 50,
    nodeBorderWidth: 5,
    normalNodeColor: 'Gray',
    startNodeColor: 'Orange',
    targetNodeColor: 'Cyan',
    answerNodeColor: 'Red',
    nodeBorderColor: 'Black',
    displayNodeLabel: true,
    edgeWidth: 7,
    normalEdgeColor: 'Gray',
    startEdgeColor: 'Orange',
    targetEdgeColor: 'Cyan',
    answerEdgeColor: 'Red',
    displayEdgeLabel: true,
  };
}
