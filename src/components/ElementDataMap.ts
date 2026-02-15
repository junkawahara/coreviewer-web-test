import { ElementDefinition } from 'cytoscape';

// 組合せ遷移問題ごとの問題データを保持するマップ型です。
// キーは問題の表示名で、値はキーに対応する問題データとなります。
export type ElementDataMap = {
  [key: string]: ElementDefinition[];
};
