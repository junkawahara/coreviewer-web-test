import cytoscape, { Core, ElementDefinition, Stylesheet } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import React, { useCallback, useLayoutEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

import { NodePosition } from './NodePosition';
import { getStyleSeetForEdgeType, zoom } from '../functions/GraphFunctions';

cytoscape.use(coseBilkent);

/**
 * 辺タイプ用の出力結果グラフのコンポーネント プロパティを表す型です。
 */
type EdgeTypeResultGraphProps = {
  // グラフ データです。
  elements: ElementDefinition[];
  // グラフ データを設定する関数です。
  setElements: React.Dispatch<React.SetStateAction<ElementDefinition[]>>;
  // ノードの位置データです。
  nodePositions: NodePosition[];
  // ソルバーの解データです。
  answer: string[];
  // スタイル シートです。
  stylesheet: Stylesheet[];
};

// 辺タイプ用の出力結果グラフを表す関数コンポーネントを定義します。
export const EdgeTypeResultGraph = (props: EdgeTypeResultGraphProps) => {
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
  // 位置の変更をグラフ インスタンスに反映させます。
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
      // グラフの大きさと位置を調整します。
      cyRef.current.fit();
      cyRef.current.center();
    }
  }, [nodePositions]);

  // 解答内の遷移ステップ変更時の処理です。
  // ステップに含まれる要素をアノテーション表示します。
  useLayoutEffect(() => {
    if (cyRef.current) {
      // 遷移対象の辺をアノテーション表示します。
      cyRef.current
        .edges()
        .filter(n => answer.includes(n.data('edgeId')))
        .addClass('answer-state');
      cyRef.current
        .edges()
        .filter(n => !answer.includes(n.data('edgeId')))
        .removeClass('answer-state');
    }
  }, [answer]);

  // 辺タイプ用のスタイル シートを取得します。
  const newStyleSheet = getStyleSeetForEdgeType(stylesheet);

  //  出力結果のグラフを表す要素を作成します。
  return (
    <CytoscapeComponent
      elements={elements}
      style={{ width: '85%', height: '85%' }}
      cy={cy => init(cy)}
      stylesheet={newStyleSheet}
    />
  );
};
