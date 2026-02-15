/** @jsxImportSource @emotion/react */

import cytoscape, { ElementDefinition, Layouts } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import edgehandles from 'cytoscape-edgehandles';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { Resizable } from 're-resizable';

import { BaseGraph } from './BaseGraph';
import { EColorTypeBaseGraph } from './EColorTypeBaseGraph';
import { EColorTypeStartGraph } from './EColorTypeStartGraph';
import { EColorTypeTargetGraph } from './EColorTypeTargetGraph';
import { EdgeTypeBaseGraph } from './EdgeTypeBaseGraph';
import { EdgeTypeStartGraph } from './EdgeTypeStartGraph';
import { EdgeTypeTargetGraph } from './EdgeTypeTargetGraph';
import { GraphDataContext } from './GraphDataProvider';
import { StartGraph } from './StartGraph';
import { TargetGraph } from './TargetGraph';
import { VColorTypeBaseGraph } from './VColorTypeBaseGraph';
import { VColorTypeStartGraph } from './VColorTypeStartGraph';
import { VColorTypeTargetGraph } from './VColorTypeTargetGraph';

cytoscape.use(edgehandles);
cytoscape.use(coseBilkent);

// グラフ領域コンポーネントに与えられるプロパティです。
type GraphAreaProps = {
  // ベース グラフ表示部の div 要素への参照です。
  baseDivRef: React.RefObject<HTMLDivElement>;
  // 問題タイプです。
  problemType: string;
  // 問題データです。
  elementData: ElementDefinition[];
  // 編集モードの有効/無効を表すフラグです。
  isEditMode: boolean;
  // ノード追加モードの有効/無効を表すフラグです。
  isAddingNodeMode: boolean;
  // ノード細分モードの有効/無効を表すフラグです。
  isSubdividingNodeMode: boolean;
  // ノード短絡モードの有効/無効を表すフラグです。
  isBypassingNodeMode: boolean;
  // ズーム値です。
  zoomFactor: number;
  // レイアウトです。
  layout: Layouts;
  // グラフを中央に移動させるかどうかを表すフラグです。
  centeringFlag: boolean;
  // ノードの削除を行うかどうかのフラグです。
  nodeRemovingFlag: boolean;
  // 開始集合グラフ表示部の div 要素への参照です。
  startDivRef: React.RefObject<HTMLDivElement>;
  // 目標集合グラフ表示部の div 要素への参照です。
  targetDivRef: React.RefObject<HTMLDivElement>;
};

// グラフ表示領域を表すコンポーネントです。
export const GraphArea = (props: GraphAreaProps) => {
  // 引数から各プロパティを取得します
  const {
    baseDivRef,
    elementData,
    isEditMode,
    isAddingNodeMode,
    isSubdividingNodeMode,
    isBypassingNodeMode,
    zoomFactor,
    layout,
    centeringFlag,
    nodeRemovingFlag,
    startDivRef,
    targetDivRef,
  } = props;

  // コンテキスト データとデータ設定用の関数を取得します。
  const { problemInfo, problemInfoMap, colorNumberMap } =
    React.useContext(GraphDataContext);

  // ベース グラフのリストを保持する状態変数を取得します。
  const [baseGraphs, setBaseGraphs] = useState<any>([]);
  // 開始集合グラフのリストを保持する状態変数を取得します。
  const [startGraphs, setStartGraphs] = useState<any>([]);
  // 目標集合グラフのリストを保持する状態変数を取得します。
  const [targetGraphs, setTargetGraphs] = useState<any>([]);

  const [moveBaseToCenter, setMoveBaseToCenter] = useState<boolean>(false);
  const [moveStartToCenter, setMoveStartToCenter] = useState<boolean>(false);
  const [moveTargetToCenter, setMoveTargetToCenter] = useState<boolean>(false);

  const [baseStartTragetHeight, setStartTragetHeigh] = useState<string>('50%');
  const [tragetGraghWidth, setTragetGraghWidth] = useState<string>('50%');

  useEffect(() => {
    setMoveBaseToCenter(centeringFlag);
    setMoveStartToCenter(centeringFlag);
    setMoveTargetToCenter(centeringFlag);
  }, [centeringFlag]);

  // ベース グラフ、開始集合グラフ、および目標集合グラフを表す要素を作成する処理です。
  // 選択された問題により表示を切り替えます。
  useLayoutEffect(() => {
    const curBaseGraphs: any[] = [];
    const curStartGraphs: any[] = [];
    const curTargetGraphs: any[] = [];
    // 各問題に対してグラフ要素を作成します。
    Object.keys(problemInfoMap).forEach(dispalyName => {
      const curProblemInfo = problemInfoMap[dispalyName];
      if (curProblemInfo) {
        // 頂点タイプ用の要素を作成します。
        if (curProblemInfo.problemType === 'vertex') {
          // ベース グラフを表す要素を作成します。
          curBaseGraphs.push(
            <div
              key={`${curProblemInfo.displayName}-base`}
              style={{
                width: '100%',
                height: '97%',
                position: 'absolute',
                zIndex: problemInfo.displayName === dispalyName ? 100 : 0,
                visibility:
                  problemInfo.displayName === dispalyName
                    ? 'visible'
                    : 'hidden',
              }}>
              <BaseGraph
                elements={elementData}
                isEditMode={isEditMode}
                isAddingNodeMode={isAddingNodeMode}
                isSubdividingNodeMode={isSubdividingNodeMode}
                isBypassingNodeMode={isBypassingNodeMode}
                zoomFactor={zoomFactor}
                layout={layout}
                centeringFlag={
                  problemInfo.displayName === dispalyName
                    ? moveBaseToCenter
                    : false
                }
                nodeRemovingFlag={
                  problemInfo.displayName === dispalyName
                    ? nodeRemovingFlag
                    : false
                }
                visible={problemInfo.displayName === dispalyName}
              />
            </div>,
          );

          // 開始集合グラフを表す要素を作成します。
          curStartGraphs.push(
            <div
              key={`${curProblemInfo.displayName}-start`}
              style={{
                width: '97%',
                height: '100%',
                position: 'absolute',
                zIndex: problemInfo.displayName === dispalyName ? 100 : 0,
                visibility:
                  problemInfo.displayName === dispalyName
                    ? 'visible'
                    : 'hidden',
              }}>
              <StartGraph
                elements={elementData}
                isEditMode={isEditMode}
                isAddingNodeMode={isAddingNodeMode}
                isSubdividingNodeMode={isSubdividingNodeMode}
                isBypassingNodeMode={isBypassingNodeMode}
                zoomFactor={zoomFactor}
                layout={layout}
                centeringFlag={
                  problemInfo.displayName === dispalyName
                    ? moveStartToCenter
                    : false
                }
                visible={problemInfo.displayName === dispalyName}
              />
            </div>,
          );

          // 目標集合グラフを表す要素を作成します。
          curTargetGraphs.push(
            <div
              key={`${curProblemInfo.displayName}-target`}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                zIndex: problemInfo.displayName === dispalyName ? 100 : 0,
                visibility:
                  problemInfo.displayName === dispalyName
                    ? 'visible'
                    : 'hidden',
              }}>
              <TargetGraph
                elements={elementData}
                isEditMode={isEditMode}
                isAddingNodeMode={isAddingNodeMode}
                isSubdividingNodeMode={isSubdividingNodeMode}
                isBypassingNodeMode={isBypassingNodeMode}
                zoomFactor={zoomFactor}
                layout={layout}
                centeringFlag={
                  problemInfo.displayName === dispalyName
                    ? moveTargetToCenter
                    : false
                }
                visible={problemInfo.displayName === dispalyName}
              />
            </div>,
          );
          // 辺タイプ用の要素を作成します。
        } else if (curProblemInfo.problemType === 'edge') {
          // ベース グラフを表す要素を作成します。
          curBaseGraphs.push(
            <div
              key={`${curProblemInfo.displayName}-base`}
              style={{
                width: '100%',
                height: '97%',
                position: 'absolute',
                zIndex: problemInfo.displayName === dispalyName ? 100 : 0,
                visibility:
                  problemInfo.displayName === dispalyName
                    ? 'visible'
                    : 'hidden',
              }}>
              <EdgeTypeBaseGraph
                elements={elementData}
                isEditMode={isEditMode}
                isAddingNodeMode={isAddingNodeMode}
                isSubdividingNodeMode={isSubdividingNodeMode}
                isBypassingNodeMode={isBypassingNodeMode}
                zoomFactor={zoomFactor}
                layout={layout}
                centeringFlag={
                  problemInfo.displayName === dispalyName
                    ? moveBaseToCenter
                    : false
                }
                nodeRemovingFlag={
                  problemInfo.displayName === dispalyName
                    ? nodeRemovingFlag
                    : false
                }
                visible={problemInfo.displayName === dispalyName}
              />
            </div>,
          );

          // 開始集合グラフを表す要素を作成します。
          curStartGraphs.push(
            <div
              key={`${curProblemInfo.displayName}-start`}
              style={{
                width: '97%',
                height: '100%',
                position: 'absolute',
                zIndex: problemInfo.displayName === dispalyName ? 100 : 0,
                visibility:
                  problemInfo.displayName === dispalyName
                    ? 'visible'
                    : 'hidden',
              }}>
              <EdgeTypeStartGraph
                elements={elementData}
                isEditMode={isEditMode}
                isAddingNodeMode={isAddingNodeMode}
                isSubdividingNodeMode={isSubdividingNodeMode}
                isBypassingNodeMode={isBypassingNodeMode}
                zoomFactor={zoomFactor}
                layout={layout}
                visible={problemInfo.displayName === dispalyName}
                centeringFlag={
                  problemInfo.displayName === dispalyName
                    ? moveStartToCenter
                    : false
                }
              />
            </div>,
          );

          // 目標集合グラフを表す要素を作成します。
          curTargetGraphs.push(
            <div
              key={`${curProblemInfo.displayName}-target`}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                zIndex: problemInfo.displayName === dispalyName ? 100 : 0,
                visibility:
                  problemInfo.displayName === dispalyName
                    ? 'visible'
                    : 'hidden',
              }}>
              <EdgeTypeTargetGraph
                elements={elementData}
                isEditMode={isEditMode}
                isAddingNodeMode={isAddingNodeMode}
                isSubdividingNodeMode={isSubdividingNodeMode}
                isBypassingNodeMode={isBypassingNodeMode}
                zoomFactor={zoomFactor}
                layout={layout}
                visible={problemInfo.displayName === dispalyName}
                centeringFlag={
                  problemInfo.displayName === dispalyName
                    ? moveTargetToCenter
                    : false
                }
              />
            </div>,
          );
        } else if (curProblemInfo.problemType === 'vcolor') {
          const numColors = colorNumberMap[curProblemInfo.displayName];
          // 頂点彩色用のベース グラフを表す要素を作成します。
          curBaseGraphs.push(
            <div
              key={`${curProblemInfo.displayName}-base`}
              style={{
                width: '100%',
                height: '97%',
                position: 'absolute',
                zIndex: problemInfo.displayName === dispalyName ? 100 : 0,
                visibility:
                  problemInfo.displayName === dispalyName
                    ? 'visible'
                    : 'hidden',
              }}>
              <VColorTypeBaseGraph
                elements={elementData}
                isEditMode={isEditMode}
                isAddingNodeMode={isAddingNodeMode}
                isSubdividingNodeMode={isSubdividingNodeMode}
                isBypassingNodeMode={isBypassingNodeMode}
                zoomFactor={zoomFactor}
                layout={layout}
                centeringFlag={
                  problemInfo.displayName === dispalyName
                    ? moveBaseToCenter
                    : false
                }
                nodeRemovingFlag={
                  problemInfo.displayName === dispalyName
                    ? nodeRemovingFlag
                    : false
                }
                visible={problemInfo.displayName === dispalyName}
              />
            </div>,
          );

          // 頂点彩色用の開始集合グラフを表す要素を作成します。
          curStartGraphs.push(
            <div
              key={`${curProblemInfo.displayName}-start`}
              style={{
                width: '97%',
                height: '100%',
                position: 'absolute',
                zIndex: problemInfo.displayName === dispalyName ? 100 : 0,
                visibility:
                  problemInfo.displayName === dispalyName
                    ? 'visible'
                    : 'hidden',
              }}>
              <VColorTypeStartGraph
                elements={elementData}
                isEditMode={isEditMode}
                isAddingNodeMode={isAddingNodeMode}
                isSubdividingNodeMode={isSubdividingNodeMode}
                isBypassingNodeMode={isBypassingNodeMode}
                zoomFactor={zoomFactor}
                numColors={numColors}
                layout={layout}
                visible={problemInfo.displayName === dispalyName}
                centeringFlag={
                  problemInfo.displayName === dispalyName
                    ? moveStartToCenter
                    : false
                }
              />
            </div>,
          );

          // 頂点彩色用の目標集合グラフを表す要素を作成します。
          curTargetGraphs.push(
            <div
              key={`${curProblemInfo.displayName}-target`}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                zIndex: problemInfo.displayName === dispalyName ? 100 : 0,
                visibility:
                  problemInfo.displayName === dispalyName
                    ? 'visible'
                    : 'hidden',
              }}>
              <VColorTypeTargetGraph
                elements={elementData}
                isEditMode={isEditMode}
                isAddingNodeMode={isAddingNodeMode}
                isSubdividingNodeMode={isSubdividingNodeMode}
                isBypassingNodeMode={isBypassingNodeMode}
                zoomFactor={zoomFactor}
                numColors={numColors}
                layout={layout}
                visible={problemInfo.displayName === dispalyName}
                centeringFlag={
                  problemInfo.displayName === dispalyName
                    ? moveTargetToCenter
                    : false
                }
              />
            </div>,
          );
        } else if (curProblemInfo.problemType === 'ecolor') {
          const numColors = colorNumberMap[curProblemInfo.displayName];
          // 辺彩色用のベース グラフを表す要素を作成します。
          curBaseGraphs.push(
            <div
              key={`${curProblemInfo.displayName}-base`}
              style={{
                width: '100%',
                height: '97%',
                position: 'absolute',
                zIndex: problemInfo.displayName === dispalyName ? 100 : 0,
                visibility:
                  problemInfo.displayName === dispalyName
                    ? 'visible'
                    : 'hidden',
              }}>
              <EColorTypeBaseGraph
                elements={elementData}
                isEditMode={isEditMode}
                isAddingNodeMode={isAddingNodeMode}
                isSubdividingNodeMode={isSubdividingNodeMode}
                isBypassingNodeMode={isBypassingNodeMode}
                zoomFactor={zoomFactor}
                layout={layout}
                centeringFlag={
                  problemInfo.displayName === dispalyName
                    ? moveBaseToCenter
                    : false
                }
                nodeRemovingFlag={
                  problemInfo.displayName === dispalyName
                    ? nodeRemovingFlag
                    : false
                }
                visible={problemInfo.displayName === dispalyName}
              />
            </div>,
          );

          // 辺彩色用の開始集合グラフを表す要素を作成します。
          curStartGraphs.push(
            <div
              key={`${curProblemInfo.displayName}-start`}
              style={{
                width: '97%',
                height: '100%',
                position: 'absolute',
                zIndex: problemInfo.displayName === dispalyName ? 100 : 0,
                visibility:
                  problemInfo.displayName === dispalyName
                    ? 'visible'
                    : 'hidden',
              }}>
              <EColorTypeStartGraph
                elements={elementData}
                isEditMode={isEditMode}
                isAddingNodeMode={isAddingNodeMode}
                isSubdividingNodeMode={isSubdividingNodeMode}
                isBypassingNodeMode={isBypassingNodeMode}
                zoomFactor={zoomFactor}
                numColors={numColors}
                layout={layout}
                visible={problemInfo.displayName === dispalyName}
                centeringFlag={
                  problemInfo.displayName === dispalyName
                    ? moveStartToCenter
                    : false
                }
              />
            </div>,
          );

          // 辺彩色用の目標集合グラフを表す要素を作成します。
          curTargetGraphs.push(
            <div
              key={`${curProblemInfo.displayName}-target`}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                zIndex: problemInfo.displayName === dispalyName ? 100 : 0,
                visibility:
                  problemInfo.displayName === dispalyName
                    ? 'visible'
                    : 'hidden',
              }}>
              <EColorTypeTargetGraph
                elements={elementData}
                isEditMode={isEditMode}
                isAddingNodeMode={isAddingNodeMode}
                isSubdividingNodeMode={isSubdividingNodeMode}
                isBypassingNodeMode={isBypassingNodeMode}
                zoomFactor={zoomFactor}
                numColors={numColors}
                layout={layout}
                visible={problemInfo.displayName === dispalyName}
                centeringFlag={
                  problemInfo.displayName === dispalyName
                    ? moveTargetToCenter
                    : false
                }
              />
            </div>,
          );
        }
      }
      // 作成した各グラフ要素のリストを状態変数に設定します。
      setBaseGraphs(curBaseGraphs);
      setStartGraphs(curStartGraphs);
      setTargetGraphs(curTargetGraphs);
    });
  }, [
    problemInfoMap,
    elementData,
    isEditMode,
    isAddingNodeMode,
    isSubdividingNodeMode,
    isBypassingNodeMode,
    zoomFactor,
    layout,
    moveBaseToCenter,
    moveStartToCenter,
    moveTargetToCenter,
    nodeRemovingFlag,
    problemInfo,
    colorNumberMap,
  ]);

  const resizableBorderWidth = '10px';
  const resizableBorderColor = '#CCCCCC';

  // グラフを中心に移動するための処理です。
  const moveToCenter = useCallback(() => {
    setMoveBaseToCenter(true);
    setMoveBaseToCenter(false);
    setMoveStartToCenter(true);
    setMoveStartToCenter(false);
    setMoveTargetToCenter(true);
    setMoveTargetToCenter(false);
  }, []);

  // 各グラフ表示部を表すエリア要素を作成します。
  return (
    <>
      <div id="top" style={{ width: '100%', height: '100%' }}>
        {/* 水平スプリッタで区切られたうちの上部の領域です。 */}
        <Resizable
          maxHeight={'100%'}
          minHeight={'20px'}
          style={{
            borderBottom: 'solid',
            borderWidth: resizableBorderWidth,
            borderColor: resizableBorderColor,
          }}
          defaultSize={{ width: '100%', height: '50%' }}
          enable={{
            top: false,
            right: false,
            bottom: true,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          onResize={(event, direction, refToElement) => {
            const height = document.getElementById('top')
              ?.clientHeight as number;
            const str = (height - refToElement.clientHeight).toString() + 'px';
            setStartTragetHeigh(str);
          }}
          onResizeStop={() => {
            moveToCenter();
          }}>
          {/* ベース グラフ表示部を表す要素です。 */}
          <div
            ref={baseDivRef}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
            }}>
            {baseGraphs}
          </div>
        </Resizable>
        {/* 水平スプリッタで区切られたうちの下部の領域です。 */}
        <div
          id="StartTargetArea"
          style={{
            display: 'flex',
            height: baseStartTragetHeight,
            width: '100%',
            alignItems: 'stretch',
          }}>
          {/* 垂直スプリッタで区切られたうちの左部の領域です。 */}
          <Resizable
            enable={{
              top: false,
              right: true,
              bottom: false,
              left: false,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false,
            }}
            style={{
              borderRight: 'solid',
              borderWidth: resizableBorderWidth,
              borderColor: resizableBorderColor,
            }}
            defaultSize={{ width: '50%', height: '100%' }}
            maxWidth={'100%'}
            onResize={(event, direction, refToElement) => {
              const width = document.getElementById('StartTargetArea')
                ?.clientWidth as number;
              const str = (width - refToElement.clientWidth).toString() + 'px';
              setTragetGraghWidth(str);
            }}
            onResizeStop={() => {
              moveToCenter();
            }}>
            {/* 開始集合グラフ表示部を表す要素です。 */}
            <div
              ref={startDivRef}
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
              }}>
              {startGraphs}
            </div>
          </Resizable>
          {/* 垂直スプリッタで区切られたうちの右部の領域です。 */}
          {/* 目標集合グラフ表示部を表す要素です。 */}
          <div
            ref={targetDivRef}
            style={{
              width: tragetGraghWidth,
              height: '100%',
              position: 'relative',
              borderWidth: resizableBorderWidth,
              boxSizing: 'border-box',
            }}>
            {targetGraphs}
          </div>
        </div>
      </div>
    </>
  );
};
