import { contextBridge, ipcRenderer } from 'electron';
import { Stylesheet } from 'cytoscape';

import { Settings } from './Settings';

// ウインドウ起動時にメイン プロセスで読み込むデータを設定します。
contextBridge.exposeInMainWorld('apiData', {
  // ファイル ダイアログを開く関数です。
  openFileDialog: async (): Promise<[string, string]> =>
    await ipcRenderer.invoke('open-file-dialog'),
  // エラー ボックスを開く関数です。
  showErrorBox: (title: string, message: string) => {
    ipcRenderer.invoke('show-error-box', title, message);
  },
  // ファイルを読み込む関数です。
  readFile: (filePath: string) => {
    return ipcRenderer.invoke('read-file', filePath);
  },
  // ソルバーを実行する関数です。
  runSolver: (
    graphData: string,
    stData: string,
    nodePositionData: string,
    problemName: string,
    stylesheet: Stylesheet[],
    numColors: number,
  ): void => {
    ipcRenderer.send(
      'run-solver',
      graphData,
      stData,
      nodePositionData,
      problemName,
      stylesheet,
      numColors,
    );
  },
  // 設定を保存する関数です。
  saveSetting: (settings: Settings): void => {
    ipcRenderer.send('save-settings', settings);
  },

  // データを保存する関数です。
  saveData: (outputData: string, outputType: string): void => {
    ipcRenderer.send('save-data', outputData);
  },

  // 画像を保存する関数です。
  saveImage: (outputImage: string[] | undefined, outputType: string): void => {
    ipcRenderer.send('save-image', outputImage, outputType);
  },

  // ソルバーをキャンセルする関数です。
  cancelSolver: (): void => {
    ipcRenderer.send('cancel-solver');
  },
  // ソルバー実行完了時のハンドラです。
  onSolverFinished: (func: any): void => {
    ipcRenderer.on('solver-finished', func);
  },
  // 問題情報の送信時のハンドラです。
  onProblemInfoSend: (func: any): void => {
    ipcRenderer.on('send-problem-info', func);
  },
  // ソルバーの結果データ送信時のハンドラです。
  onDataSend: (func: any): void => {
    ipcRenderer.on('send-data', func);
  },
  // 設定データ送信時のハンドラです。
  onSettingsSend: (func: any): void => {
    ipcRenderer.on('send-settings', func);
  },
  // データ保存用のデータ要求時のハンドラ登録用関数です。
  onOutputDataRequired: (func: any): void => {
    ipcRenderer.on('require-output-data', func);
  },
  // 画像保存用のデータ要求時のハンドラ登録用関数です。
  onOutputImageRequired: (func: any): void => {
    ipcRenderer.on('require-output-image', func);
  },
  // ハンドラを削除する関数です。
  removeHandler: (channel: string): void => {
    ipcRenderer.removeAllListeners(channel);
  },
});
