import {ProblemInfo} from '../ProblemInfo';

/**
 * Web 版用の問題リストデータです。
 * problem_list.csv の内容を TypeScript オブジェクトとして保持します。
 */
export const problemListData: {[key: string]: ProblemInfo} = {
  'Vertex-Mode1': {
    displayName: 'Vertex-Mode1',
    problemType: 'vertex',
    args: '--indset --st',
  },
  'Edge-Mode1': {
    displayName: 'Edge-Mode1',
    problemType: 'edge',
    args: '--forest --st',
  },
  'Vertex-Mode2': {
    displayName: 'Vertex-Mode2',
    problemType: 'vertex',
    args: '--forest --st foo',
  },
  'Edge-Mode2': {
    displayName: 'Edge-Mode2',
    problemType: 'edge',
    args: '--forest --st bar',
  },
  'Vertex-Color-Mode1': {
    displayName: 'Vertex-Color-Mode1',
    problemType: 'vcolor',
    args: '',
  },
  'Edge-Color-Mode2': {
    displayName: 'Edge-Color-Mode2',
    problemType: 'ecolor',
    args: '',
  },
};
