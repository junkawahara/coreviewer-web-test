// グラフのレイアウトの定義です。
export const layouts: Record<string, any> = {
  // ランダムな配置を行うレイアウトの定義です。
  random: {
    name: 'random',
    animate: true,
    fit: false,
  },
  // グリッド状の配置を行うレイアウトの定義です。
  grid: {
    name: 'grid',
    animate: true,
    fit: false,
    avoidOverlap: true,
  },
  // 円形の配置を行うレイアウトの定義です。
  circle: {
    name: 'circle',
    animate: true,
    fit: false,
    avoidOverlap: true,
  },
  // 全てのノードを原点の配置するレイアウトの定義です。
  null: {
    name: 'null',
    animate: false,
    fit: false,
  },
  // 同心円状にノードを配置するレイアウトの定義です。
  concentric: {
    name: 'concentric',
    animate: true,
    fit: false,
    avoidOverlap: true,
  },
  // 幅優先探索に基づきノードを階層的に配置するレイアウトの定義です。
  breadthfirst: {
    name: 'breadthfirst',
    animate: true,
    fit: false,
    avoidOverlap: true,
  },
  // 物理シミュレーションに基づきノードを配置するレイアウトの定義です。
  cose: {
    name: 'cose',
    animate: true,
    fit: false,
  },
  // cose-bilkent レイアウト (cose レイアウトのバリアントの一種) の定義です。
  coseBilkent: {
    name: 'cose-bilkent',
    nodeDimensionsIncludeLabels: true,
    padding: 30,
    idealEdgeLength: 100,
    edgeElasticity: 0.1,
    fit: false,
  },
};
