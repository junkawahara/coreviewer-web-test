import cytoscape, { Core, ElementDefinition, Stylesheet } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

import { NodePosition } from './NodePosition';
import {
  getStyleSeetForVColorType,
  removeColorIndexClass,
  zoom,
} from '../functions/GraphFunctions';

cytoscape.use(coseBilkent);

/**
 * 出力結果グラフのプロパティを表す型です。
 */
type VColorTypeResultGraphProps = {
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
  // 色数です。
  numColors: number;
};

// 頂点彩色タイプ用の出力結果グラフを表す関数コンポーネントを定義します。
export const VColorTypeResultGraph = (props: VColorTypeResultGraphProps) => {
  // 引数から各プロパティを取得します。
  const { elements, nodePositions, answer, stylesheet, numColors } = props;

  // グラフの参照を取得します。
  const cyRef = useRef<Core | null>(null);

  // 頂点彩色問題用のスタイル シートを保持する変数を取得します。
  const [vColorStylesheet, setVColorStylesheet] = useState<Stylesheet[]>([]);

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

  // スタイル、または色数が変更された場合の処理です。
  useLayoutEffect(() => {
    setVColorStylesheet(getStyleSeetForVColorType(stylesheet, numColors));
  }, [stylesheet, numColors]);

  // 解答内の遷移ステップ変更時の処理です。
  useLayoutEffect(() => {
    if (cyRef.current) {
      removeColorIndexClass(cyRef);
      // 各ノードの色インデックスを取得します。
      const colorIndexMap: { [key: string]: number } = {};
      for (let answerIndex = 0; answerIndex < answer.length; answerIndex++) {
        colorIndexMap[`${answerIndex + 1}`] = parseInt(answer[answerIndex]);
      }
      // 取得した色インデックスに基づき各ノードのクラスを更新します。
      cyRef.current.nodes().forEach(node => {
        let colorIndex = colorIndexMap[node.data('id')];
        colorIndex = colorIndex !== undefined ? colorIndex : -1;
        const newClass =
          colorIndex >= 1 ? `color-index-${colorIndex}` : `color-index-null`;
        node.addClass(newClass);
      });
    }
  }, [answer]);

  //  出力結果のグラフを表す要素を作成します。
  return (
    <CytoscapeComponent
      elements={elements}
      style={{ width: '85%', height: '85%' }}
      cy={cy => init(cy)}
      stylesheet={vColorStylesheet}
    />
  );
};
