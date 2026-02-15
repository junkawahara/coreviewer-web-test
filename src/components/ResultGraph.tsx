import cytoscape, { Core, ElementDefinition, Stylesheet } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import React, { useCallback, useLayoutEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

import { NodePosition } from './NodePosition';
import { zoom } from '../functions/GraphFunctions';

cytoscape.use(coseBilkent);

/**
 * 出力結果グラフのコンポーネントプロパティを表す型です。
 */
type ResultGraphProps = {
  // グラフ データです。
  elements: ElementDefinition[];
  // グラフ データを設定する関数です。
  setElements: React.Dispatch<React.SetStateAction<ElementDefinition[]>>;
  // グラフ データを設定する関数です。
  nodePositions: NodePosition[];
  // ソルバーの解データです。
  answer: string[];
  // スタイル シートです。
  stylesheet: Stylesheet[];
};

// 頂点タイプ用の出力結果グラフを表す関数コンポーネントを定義します。
export const ResultGraph = (props: ResultGraphProps) => {
  // 引数から各プロパティを取得します。
  const { elements, nodePositions, answer, stylesheet } = props;

  // グラフのインスタンスの参照を取得します。
  const cyRef = useRef<Core | null>(null);

  // グラフの初期設定を行う関数を作成します。
  const init = useCallback((cy: Core) => {
    if (!cyRef.current) {
      cyRef.current = cy;
      cy.on('zoom', () => {
        zoom(cy, cy.zoom());
      });
    }
  }, []);

  // ノードの位置変更時の処理です。
  useLayoutEffect(() => {
    if (cyRef.current) {
      // ノードの位置データを設定します。
      nodePositions.forEach(nodePosition => {
        if (nodePosition.x !== undefined && nodePosition.y !== undefined) {
          cyRef.current
            ?.getElementById(nodePosition.id)
            .position({ x: nodePosition.x, y: nodePosition.y });
        }
      });
      cyRef.current.fit();
      cyRef.current.center();
    }
  }, [nodePositions]);

  // 解答内の遷移ステップ変更時の処理です。
  useLayoutEffect(() => {
    if (cyRef.current) {
      // 遷移対象の頂点をアノテーション表示します。
      cyRef.current
        .nodes()
        .filter(node => answer.includes(node.data('id')))
        .addClass('answer-state');
      cyRef.current
        .nodes()
        .filter(node => !answer.includes(node.data('id')))
        .removeClass('answer-state');
    }
  }, [answer]);

  //  出力結果のグラフを表す要素を作成します。
  return (
    <CytoscapeComponent
      elements={elements}
      style={{ width: '85%', height: '85%' }}
      cy={cy => init(cy)}
      stylesheet={stylesheet}
    />
  );
};
