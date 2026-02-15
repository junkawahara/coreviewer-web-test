import { Stylesheet } from 'cytoscape';
import { Settings } from '../Settings';

declare global {
  interface Window {  // eslint-disable-line
    apiData: APIData;
  }
}

/**
 * プロセス間で共有するデータ型です。
 */
export type APIData = {
  // ファイル ダイアログを開く関数です。
  openFileDialog: () => Promise<[string, string]>;
  // エラー ボックスを表示する関数です。
  showErrorBox: (title: string, message: string) => void;
  // ファイルを読み込む関数です。
  readFile: (filePath: string) => Promise<any>;
  // ソルバーを実行する関数です。
  runSolver: (
    graphData: string,
    stData: string,
    nodePositionData: string,
    problemName: string,
    stylesheet: Stylesheet[],
    numColors: number,
  ) => void;
  // 設定を保存する関数です。
  saveSetting: (settings: Settings) => void;
  // データを保存する関数です。
  saveData: (outputData: string, outputType: string) => void;
  // 画像を保存する関数です。
  saveImage: (outputImage: string[], outputType: string) => void;
  // ソルバーの実行をキャンセルするための関数です。
  cancelSolver: () => void;
  // ソルバー実行完了時の処理を行う関数です。
  onSolverFinished: (func: any) => void;
  // 問題情報の送信時のハンドラを登録するための関数です。
  onProblemInfoSend: (func: any) => void;
  // ソルバーのデータ送信時の処理を行う関数です。
  onDataSend: (func: any) => void;
  // ソルバーの設定送信時の処理を行う関数です。
  onSettingsSend: (func: any) => void;
  // データ保存用データ要求時の処理を行う関数です。
  onOutputDataRequired: (func: any) => void;
  // 画像保存用データ要求時の処理を行う関数です。
  onOutputImageRequired: (func: any) => void;
  // ハンドラを削除する関数です。
  removeHandler: (channel: string) => void;
};
