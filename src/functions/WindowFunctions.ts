import { app, BrowserWindow, dialog, Menu } from 'electron';
import path from 'path';
import { Stylesheet } from 'cytoscape';

import { ProblemInfoMap } from '../ProblemInfo';
import { Settings } from '../Settings';
import { SolverInfoMap } from '../SolverInfo';

type Func = () => void;

// メイン ウィンドウのサイズです。
const mainWindowWidth = 1920;
const mainWindowHeight = 1080;

// 出力結果ウィンドウのサイズです。
const resultWindowWidth = 800;
const resultWindowHeight = 800;

// 設定ウィンドウのサイズです。
const settingWindowWidth = 800;
// const settingWindowHeight = 200;
const settingWindowHeight = 900;

/**
 * メイン ウィンドウを作成します。
 * @param {string} appMode アプリケーションの実行モード
 * @param {ProblemInfoMap} problemInfoMap 問題情報のマップ
 * @param {SolverInfoMap} solverInfoMap ソルバー情報のマップ
 * @param {Settings} settings アプリケーションの設定
 * @param { Func } onSettingSelected メニューの設定項目選択時の処理
 * @return {BrowserWindow} メイン ウィンドウ
 */
export function createMainWindow(
  appMode: string,
  problemInfoMap: ProblemInfoMap,
  solverInfoMap: SolverInfoMap,
  settings: Settings,
  onSettingSelected: Func,
): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: mainWindowWidth,
    height: mainWindowHeight,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      contextIsolation: true,
      preload: path.join(app.getAppPath(), 'preload.js'),
    },
  });

  // メイン ウインドウに表示する HTML を読み込みます。
  mainWindow.loadFile('./index.html');

  // 開発者ツールを起動します。 // DEBUG :
  // mainWindow.webContents.openDevTools();

  // メニューを作成します。
  const menu: any[] = [
    // ファイル メニューです。
    {
      label: 'ファイル',
      submenu: [
        {
          label: '名前を付けて保存...',
          submenu: [
            {
              label: 'データ',
              submenu: [
                {
                  label: '全体データ',
                  click: () => {
                    mainWindow.webContents.send(
                      'require-output-data',
                      'wholedata',
                    );
                  },
                },
                {
                  label: 'グラフ データ',
                  click: () => {
                    mainWindow.webContents.send(
                      'require-output-data',
                      'graphdata',
                    );
                  },
                },
                {
                  label: '開始・目標データ',
                  click: () => {
                    mainWindow.webContents.send(
                      'require-output-data',
                      'stdata',
                    );
                  },
                },
              ],
            },
            {
              label: '画像',
              submenu: [
                {
                  label: '全てのグラフ画像',
                  click: () => {
                    mainWindow.webContents.send('require-output-image', 'all');
                  },
                },
                {
                  label: 'ベース グラフ画像',
                  click: () => {
                    mainWindow.webContents.send(
                      'require-output-image',
                      'basegraph',
                    );
                  },
                },
                {
                  label: '開始集合グラフ画像',
                  click: () => {
                    mainWindow.webContents.send(
                      'require-output-image',
                      'startgraph',
                    );
                  },
                },
                {
                  label: '目標集合グラフ画像',
                  click: () => {
                    mainWindow.webContents.send(
                      'require-output-image',
                      'targetgraph',
                    );
                  },
                },
              ],
            },
          ],
        },
        { type: 'separator' },
        { role: 'quit', label: '終了' },
      ],
    },
    // ツール メニューです。
    {
      label: 'ツール',
      submenu: [
        {
          label: '設定',
          click: onSettingSelected,
        },
      ],
    },
    // ヘルプ メニューです。
    {
      label: 'ヘルプ',
      submenu: [
        {
          label: 'バージョン',
          click: () => {
            let version = '';
            if (appMode === 'dev') {
              if (process.env.npm_package_version !== undefined) {
                version = process.env.npm_package_version;
              }
            } else {
              version = app.getVersion();
            }
            dialog.showMessageBoxSync(mainWindow, {
              type: 'info',
              title: 'ソフトウェア バージョン',
              message: `バージョン : ${version}`,
            });
          },
        },
      ],
    },
  ];
  // macOS の場合です。
  if (process.platform === 'darwin') {
    // メニュー項目を 1 つずらします。
    menu.unshift({ label: '' });
    // アプリケーションのメニューに設定します。
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  }
  // macOS 以外の場合です。
  else {
    mainWindow.setMenu(Menu.buildFromTemplate(menu));
  }

  // ウィンドウ表示時の処理を設定します。
  mainWindow.once('ready-to-show', () => {
    mainWindow.webContents.send('send-problem-info', problemInfoMap);
    const solvers = Object.keys(solverInfoMap);
    mainWindow.webContents.send(
      'send-settings',
      settings,
      solvers,
      'MainWindow',
    );
    mainWindow.show();
  });
  return mainWindow;
}

/**
 * 出力結果ウィンドウを作成します。
 * @param {BrowserWindow} mainWindow メイン ウィンドウ
 * @param {string} graphData 問題のグラフ データ
 * @param {string} nodePositionData  グラフ中の各ノードの位置データ
 * @param {string} answerData ソルバーが求めた解データ
 * @param {string} problemType 問題タイプ
 * @param {Stylesheet[]} stylesheet グラフのスタイル シート
 * @param {number} numColors 彩色問題における色数
 * @param {Func} onReadyToShow ウィンドウ表示時の処理を行う関数
 * @return {BrowserWindow} 出力結果ウィンドウ
 */
export function createResultWindow(
  mainWindow: BrowserWindow,
  graphData: string,
  nodePositionData: string,
  answerData: string,
  problemType: string,
  stylesheet: Stylesheet[],
  numColors: number,
  onReadyToShow: Func,
): BrowserWindow {
  let resultWindow: BrowserWindow;
  // mac の場合はモーダル ウインドウがうまく働きません。
  // 代わりに alwaysOnTop プロパティを使用します。
  if (process.platform === 'darwin') {
    resultWindow = new BrowserWindow({
      width: resultWindowWidth,
      height: resultWindowHeight,
      parent: mainWindow,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: false,
        nodeIntegrationInWorker: false,
        contextIsolation: true,
        preload: path.join(app.getAppPath(), 'preload.js'),
      },
    });
  } else {
    // macOS 以外の場合はモーダル ウインドウにします。
    resultWindow = new BrowserWindow({
      width: resultWindowWidth,
      height: resultWindowHeight,
      parent: mainWindow,
      modal: true,
      webPreferences: {
        nodeIntegration: false,
        nodeIntegrationInWorker: false,
        contextIsolation: true,
        preload: path.join(app.getAppPath(), 'preload.js'),
      },
    });
  }

  // 開発者ツールを起動します。
  // resultWindow.webContents.openDevTools();

  // 出力結果ウィンドウに表示する HTML を読み込みます。
  resultWindow.loadFile('./result_window.html');

  // メニューを無効にします。
  resultWindow.setMenu(null);

  // 出力結果ウィンドウにソルバーの出力データを送信するハンドラを設定します。
  resultWindow.on('ready-to-show', () => {
    resultWindow.webContents.send(
      'send-data',
      graphData,
      nodePositionData,
      answerData,
      problemType,
      stylesheet,
      numColors,
    );
    onReadyToShow();
  });

  // macOS の場合は手動でメイン ウインドウを有効化します。
  if (process.platform === 'darwin') {
    resultWindow.on('close', () => {
      mainWindow.setIgnoreMouseEvents(false);
    });
  }
  return resultWindow;
}

/**
 * 設定ウィンドウを作成します。
 * @param {BrowserWindow} mainWindow メインウィンドウ
 * @param {Settings} settings アプリケーションの設定
 * @param {SolverInfoMap} solverInfoMap ソルバーの情報マップ
 * @return {BrowserWindow} 設定ウィンドウ
 */
export function createSettingWindow(
  mainWindow: BrowserWindow,
  settings: Settings,
  solverInfoMap: SolverInfoMap,
): BrowserWindow {
  let settingWindow: BrowserWindow;
  // mac の場合はモーダル ウインドウがうまく働きません。
  // 代わりに alwaysOnTop プロパティを使用します。
  if (process.platform === 'darwin') {
    settingWindow = new BrowserWindow({
      width: settingWindowWidth,
      height: settingWindowHeight,
      parent: mainWindow,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: false,
        nodeIntegrationInWorker: false,
        contextIsolation: true,
        preload: path.join(app.getAppPath(), 'preload.js'),
      },
    });
    // macOS の場合は手動でメイン ウインドウを無効化します。
    if (process.platform === 'darwin') {
      mainWindow.setIgnoreMouseEvents(true);
    }
  } else {
    // macOS 以外の場合はモーダル ウインドウにします。
    settingWindow = new BrowserWindow({
      width: settingWindowWidth,
      height: settingWindowHeight,
      parent: mainWindow,
      modal: true,
      webPreferences: {
        nodeIntegration: false,
        nodeIntegrationInWorker: false,
        contextIsolation: true,
        preload: path.join(app.getAppPath(), 'preload.js'),
      },
    });
  }

  // 開発者ツールを起動します。 // DEBUG :
  // settingWindow.webContents.openDevTools();

  // 設定ウィンドウに表示する HTML を読み込みます。
  settingWindow.loadFile('./setting_window.html');

  // メニューは無効にします。
  settingWindow.setMenu(null);

  // 設定ウィンドウに現在の設定情報を送信するハンドラを設定します。
  settingWindow.on('ready-to-show', () => {
    const solvers = Object.keys(solverInfoMap);
    settingWindow.webContents.send(
      'send-settings',
      settings,
      solvers,
      'SettingWindow',
    );
  });

  // macOS の場合は手動でメイン ウインドウを有効化します。
  if (process.platform === 'darwin') {
    settingWindow.on('close', () => {
      mainWindow.setIgnoreMouseEvents(false);
    });
  }
  return settingWindow;
}
