import { Stylesheet } from 'cytoscape';

// グラフで使用するスタイルの定義です。
export default [
  // ノードのスタイル定義です。
  {
    selector: 'node',
    style: {
      width: 50,
      height: 50,
    },
  },
  {
    selector: 'edge',
    style: {},
  },
  // クリックされた際のノードのスタイル定義です。
  {
    selector: 'node:selected',
    style: {
      'border-style': 'dotted',
    },
  },
  // 開始位置にあるノードのスタイル定義です。
  {
    selector: 'node.start-state',
    style: {},
  },
  // 目標位置にあるノードのスタイル定義です。
  {
    selector: 'node.target-state',
    style: {},
  },
  // 解答の遷移ステップに含まれるノードのスタイル定義です。
  {
    selector: 'node.answer-state',
    style: {
      'background-color': 'orange',
    },
  },

  // トークンのスタイル定義です。
  {
    selector: '.token',
    style: {
      'background-color': 'red',
    },
  },

  // エッジ選択時のスタイル定義です。
  {
    selector: 'edge:selected',
    style: {
      'line-color': '#999999',
    },
  },

  // エッジ連結の際のスタイル定義です。
  {
    selector: '.eh-handle',
    style: {
      'background-color': 'red',
      width: 12,
      height: 12,
      shape: 'ellipse',
      'overlay-opacity': 0,
      'border-width': 12,
      'border-opacity': 0,
    },
  },

  // エッジ連結中のホバー部分のスタイル定義です。
  {
    selector: '.eh-hover',
    style: {
      'background-color': 'red',
    },
  },

  // エッジ連結中のソース ノードのスタイル定義です。
  {
    selector: '.eh-source',
    style: {
      'border-width': 2,
      'border-color': 'red',
    },
  },

  // エッジ連結中のターゲット ノードのスタイル定義です。
  {
    selector: '.eh-target',
    style: {
      'border-width': 2,
      'border-color': 'red',
    },
  },

  // エッジ連結中のプレビュー部分、および仮想エッジのスタイル定義です。
  {
    selector: '.eh-preview, .eh-ghost-edge',
    style: {
      'background-color': 'red',
      'line-color': 'red',
      'target-arrow-color': 'red',
      'source-arrow-color': 'red',
    },
  },

  // エッジ連結中の仮想エッジでプレビューがアクティブとなっているもののスタイル定義です。
  {
    selector: '.eh-ghost-edge.eh-preview-active',
    style: {
      opacity: 0,
    },
  },

  // 開始位置にあるエッジのスタイル定義です。
  {
    selector: 'edge.start-state',
    style: {},
  },
  // 目標位置にあるエッジのスタイル定義です。
  {
    selector: 'edge.target-state',
    style: {},
  },

  // 解答の遷移ステップに含まれるのエッジのスタイル定義です。
  {
    selector: 'edge.answer-state',
    style: {
      'line-color': 'orange',
    },
  },

  // エッジ更新時のスタイル定義です。
  {
    selector: '.updating',
    style: {
      label: 'updating...',
    },
  },
] as Stylesheet[];
