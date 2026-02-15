import { ElementDefinition } from 'cytoscape';

/**
 * グラフ関連のコンポーネントのプロパティを表す型です。
 */
export type GraphProps = {
  // グラフ データの配列です。
  elements: ElementDefinition[];

  // 編集モード フラグです。
  isEditMode: boolean;

  // ノード追加モード フラグです。
  isAddingNodeMode: boolean;

  // ノード細分モード フラグです。
  isSubdividingNodeMode: boolean;

  // ノード短絡モード フラグです。
  isBypassingNodeMode: boolean;

  // ズーム値です。
  zoomFactor: number;

  // レイアウトです。
  layout: any;

  // グラフを中央へ移動するかどうかのフラグです。
  centeringFlag?: boolean;

  // ノードを削除するかどうかを表すフラグです。
  nodeRemovingFlag?: boolean;

  // グラフの表示/非表示を表すフラグです。
  visible?: boolean;

  // 彩色問題における色数です。
  numColors?: number;
};
