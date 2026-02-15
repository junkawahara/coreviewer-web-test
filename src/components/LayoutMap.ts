import { Layouts } from 'cytoscape';

// 組合せ遷移問題ごとのレイアウトを保持するマップ型です。
// キーは問題の表示名で、値はキーに対応するレイアウトとなります。
export type LayoutMap = {
  [key: string]: Layouts;
};
