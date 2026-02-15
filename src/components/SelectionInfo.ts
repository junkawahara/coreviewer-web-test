/**
 * グラフの要素の選択状態を保持する型です。
 */
export type SelectionInfo = {
  // 対象となる要素の ID です。
  id: string;
  // 選択状態を表すフラグです。
  selected: boolean;
};
