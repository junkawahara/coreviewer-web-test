import childProcess from 'child_process';
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  IpcMainInvokeEvent,
} from 'electron';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { Worker } from 'worker_threads';
import { Stylesheet } from 'cytoscape';
import xml2js from 'xml2js';

import { Settings, BUILTIN_SOLVER_NAME } from './Settings';
import {
  readProblemInfo,
  readSettingFile,
  readSolverListFile,
} from './functions/DataFunctions';
import {
  createMainWindow,
  createResultWindow,
  createSettingWindow,
} from './functions/WindowFunctions';

app.disableHardwareAcceleration();

// アプリケーション ファイルが存在するディレクトリのパスを設定します。
let appDirPath = '';
if (process.argv.length < 3) {
  appDirPath = getAppDirPath();
} else {
  appDirPath = process.argv[2];
}

// アプリケーションの実行モードを設定します。
let appMode = '';
if (process.argv.length >= 4) {
  appMode = process.argv[3];
}

// ソルバーの入力となるグラフ データ、および開始、目標データ ファイルのパスを取得します。
const graphColFileName = 'graph.col';
const stDataFileName = 'st.dat';
const graphColFile = path.join(appDirPath, graphColFileName);
const stDataFile = path.join(appDirPath, stDataFileName);

// 問題リスト ファイルのパスを設定します。
const problemListFilePath = `${appDirPath}problem_list.csv`;

// ソルバー リスト ファイルのパスを設定します。
const solverListFilePath = `${appDirPath}solver_list.csv`;

// 設定ファイルのパスを設定します。
const settingFilePath = `${appDirPath}config.xml`;

// 問題リスト ファイルを読み込みます。
const [problemInfoMap, problemListError] = readProblemInfo(problemListFilePath);

// 問題リスト ファイルの読み込みエラーが発生した場合はエラー メッセージを表示して終了します。
if (problemListError.length !== 0) {
  dialog.showErrorBox(
    'エラー',
    `問題リスト ファイル読み込み時に以下のエラーが発生しました。\n\n${problemListError}`,
  );
  app.quit();
}

// 設定ファイルを読み込みます。
let curProblemName = '';
let [settings, settingError] = readSettingFile(settingFilePath);
if (settingError) {
  dialog.showErrorBox(
    'エラー',
    `設定ファイル読み込み時に以下のエラーが発生しました。\n\n${settingError}`,
  );
  app.quit();
}

// ソルバー リスト ファイルを読み込みます。
const [solverInfoMap, solverListError] = readSolverListFile(
  solverListFilePath,
  appDirPath,
);
// ソルバー リスト ファイルの読み込みエラーが発生した場合はエラー メッセージを表示して終了します。
if (solverListError.length !== 0) {
  dialog.showErrorBox(
    'エラー',
    `ソルバー リスト ファイル読み込み時に以下のエラーが発生しました。\n\n${solverListError}`,
  );
  app.quit();
}

// 内蔵ソルバーをソルバー情報マップに追加します。
solverInfoMap[BUILTIN_SOLVER_NAME] = {
  name: BUILTIN_SOLVER_NAME,
  path: '__builtin__',
  args: '',
};

// 設定のソルバーが存在しない場合は内蔵ソルバーをデフォルトにします。
if (!solverInfoMap[settings.solver]) {
  settings.solver = BUILTIN_SOLVER_NAME;
}

// メイン ウィンドウを保持する変数です。
let mainWindow: BrowserWindow;

// Electron の起動準備が終わったら、ウィンドウを作成します。
app.whenReady().then(
  () =>
    (mainWindow = createMainWindow(
      appMode,
      problemInfoMap,
      solverInfoMap,
      settings,
      () => {
        createSettingWindow(mainWindow, settings, solverInfoMap);
      },
    )),
);

// すべての ウィンドウが閉じられた場合のハンドラを設定します。
app.on('window-all-closed', () => {
  // 内蔵ソルバーが実行中の場合は終了します。
  if (activeWorker !== null) {
    activeWorker.terminate();
    activeWorker = null;
  }
  // ソルバーのデータが残っている場合は削除します。
  if (fs.existsSync(stDataFile)) {
    fs.unlink(stDataFile, () => {
      // ファイルが重い場合は削除時にビジーとなりエラーとなる場合がありますが、
      // ここでは無視します。
    });
  }
  if (fs.existsSync(graphColFile)) {
    fs.unlink(graphColFile, () => {
      // ファイルが重い場合は削除時にビジーとなりエラーとなる場合がありますが、
      // ここでは無視します。
    });
  }
  app.quit();
});

// macOS 用の処理です。
app.on('activate', () => {
  // macOS では、ウインドウが閉じてもメインプロセスは停止しないため、
  // ドックから再度ウインドウが表示されるようにします。
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createMainWindow(
      appMode,
      problemInfoMap,
      solverInfoMap,
      settings,
      () => {
        createSettingWindow(mainWindow, settings, solverInfoMap);
      },
    );
  }
});

// ファイル ダイアログ表示を行うイベント ハンドラを設定します。
ipcMain.handle('open-file-dialog', async () => {
  // ファイル ダイアログを開きます。
  const paths = dialog.showOpenDialogSync({
    buttonLabel: 'Open',
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'Text Files', extensions: ['txt', 'text'] },
      { name: 'COL Files', extensions: ['col'] },
    ],
    properties: ['openFile'],
  });

  let result = '';
  let path = '';
  // パスが指定された場合は、そのパスのファイルを読み込みます。
  if (paths !== undefined) {
    path = paths[0];
    const buf = await fsPromises.readFile(path);
    result = buf.toString();
  }

  return [path, result];
});

// ソルバー実行中のエラー表示を無視するかどうかのフラグです。
let ignoreErrorReport = false;

let processId: number | null = null;
let activeWorker: Worker | null = null;
// ソルバーを実行するイベント ハンドラを設定します。
ipcMain.on('run-solver', getHandlerToRunSolver());

// 設定保存を行うハンドラを設定します。
ipcMain.on('save-settings', (e: any, newSettings: Settings) => {
  const builder = new xml2js.Builder({ rootName: 'config' });
  const settingsXml = builder.buildObject(newSettings);
  // 設定データをファイルに書き込みます。
  try {
    fs.writeFileSync(settingFilePath, settingsXml);
    settings = newSettings;
    const solvers = Object.keys(solverInfoMap);

    // メイン ウィンドウに与えられた設定を送信します。
    mainWindow.webContents.send(
      'send-settings',
      settings,
      solvers,
      'MainWindow',
    );
    return;
    // エラー時の処理です。
  } catch (error: any) {
    dialog.showErrorBox(
      'エラー',
      `設定の保存に失敗しました。\n* ファイル パス : ${settingFilePath}`,
    );
    return;
  }
});

// ソルバーのキャンセル時のハンドラを設定します。
ipcMain.on('cancel-solver', () => {
  // 内蔵ソルバー（Worker Thread）のキャンセル処理です。
  if (activeWorker !== null) {
    ignoreErrorReport = true;
    activeWorker.terminate();
    activeWorker = null;
    mainWindow.webContents.send('solver-finished');
    curProblemName = '';
    return;
  }
  // 外部ソルバー（プロセス）のキャンセル処理です。
  if (processId !== null) {
    process.kill(processId);
    mainWindow.webContents.send('solver-finished');
    processId = null;
    ignoreErrorReport = true;
    curProblemName = '';
  }
});

// エラー メッセージ表示用のハンドラを設定します。
ipcMain.handle(
  'show-error-box',
  (event: IpcMainInvokeEvent, title: string, message: string) => {
    dialog.showErrorBox(title, message);
  },
);

// テキスト ファイル読み込み用のハンドラを設定します。
ipcMain.handle('read-file', async (event, filePath) => {
  const data = await fs.promises.readFile(filePath);
  return data.toString();
});

// データ保存用のハンドラを設定します。
ipcMain.on('save-data', (event, outputData, outputType) => {
  // ダイアログのハンドラを取得します。
  let title = '';
  switch (outputType) {
    case 'wholedata':
      title = '全体データ保存';
      break;
    case 'graphdata':
      title = 'グラフ データ保存';
      break;
    case 'stdata':
      title = '開始・目標データ保存';
      break;
  }

  // 保存用ダイアログを開きます。
  const outputPath = dialog.showSaveDialogSync(mainWindow, {
    title,
    buttonLabel: '保存',
    properties: ['createDirectory'],
  });

  // パスが指定されなかった場合はなにもせず終了します。
  if (outputPath === undefined) {
    return;
  }

  // 取得したパスにデータを書き込みます。
  try {
    fs.writeFileSync(outputPath, outputData);
    return;
  } catch (error: any) {
    dialog.showErrorBox(
      'エラー',
      `データの保存に失敗しました。\n* ファイル パス : ${outputPath}`,
    );
    return;
  }
});

// 画像保存用のハンドラを設定します。
ipcMain.on('save-image', async (event, outputImages, outputType) => {
  // ダイアログのハンドラを取得します。
  let title = '';
  switch (outputType) {
    case 'all':
      title = '全グラフの画像保存';
      break;
    case 'basegraph':
      title = 'ベース グラフの画像保存';
      break;
    case 'startgraph':
      title = '開始集合グラフの画像保存';
      break;
    case 'targetgraph':
      title = '目標集合グラフの画像保存';
      break;
  }

  let errorMessage = '';
  if (outputType === 'all') {
    if (
      outputImages[0].length !== 0 ||
      outputImages[1].length !== 0 ||
      outputImages[2].length !== 0
    ) {
      const outputDirPath = dialog.showOpenDialogSync(mainWindow, {
        title,
        buttonLabel: '保存',
        properties: ['createDirectory', 'openDirectory'],
      });

      // パスが指定されなかった場合はなにもせず終了します。
      if (outputDirPath === undefined || outputDirPath.length === 0) {
        return;
      }

      // 取得したパスのディレクトリ以下に画像を出力します。
      try {
        for (let imageIndex = 0; imageIndex < 3; imageIndex++) {
          let fileName = '';
          switch (imageIndex) {
            case 0:
              fileName = 'base_graph.png';
              break;
            case 1:
              fileName = 'start_graph.png';
              break;
            case 2:
              fileName = 'target_graph.png';
              break;
          }
          const outputPath = path.join(outputDirPath[0], fileName);
          const fileData = outputImages[imageIndex].replace(
            /^data:\w+\/\w+;base64,/,
            '',
          );
          const binaryImage = new Uint8Array(
            [...atob(fileData)].map(data => data.charCodeAt(0)),
          );
          fs.writeFileSync(outputPath, binaryImage);
        }
      } catch (error: any) {
        errorMessage = `画像の保存に失敗しました。\n* ディレクトリ パス : ${outputDirPath}`;
      }
    } else {
      errorMessage = 'グラフの画像データが取得できませんでした。';
    }
  } else {
    // 保存用ダイアログを開きます。
    const outputPath = dialog.showSaveDialogSync(mainWindow, {
      title,
      buttonLabel: '保存',
      properties: ['createDirectory'],
      filters: [
        { name: 'Images', extensions: ['png'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    // パスが指定されなかった場合はなにもせず終了します。
    if (outputPath === undefined) {
      return;
    }

    // 取得したパスにデータを書き込みます。
    try {
      const fileData = outputImages[0].replace(/^data:\w+\/\w+;base64,/, '');
      const binaryImage = new Uint8Array(
        [...atob(fileData)].map(data => data.charCodeAt(0)),
      );
      fs.writeFileSync(outputPath, binaryImage);
    } catch (error: any) {
      errorMessage = `データの保存に失敗しました。\n* ファイル パス : ${outputPath}`;
    }

    if (errorMessage.length > 0) {
      dialog.showErrorBox(
        'エラー',
        `データの保存に失敗しました。\n* ${errorMessage}`,
      );
    }
  }
});

/**
 * アプリケーション ファイルが存在するディレクトリのパスを取得する関数を定義します。
 * @return {string} アプリケーション ファイルが存在するディレクトリのパス
 */
function getAppDirPath(): string {
  const netAppDirPath = path.dirname(__filename);
  if (process.platform === 'win32') {
    return path.join(netAppDirPath, '../../');
  } else if (process.platform === 'darwin') {
    return path.join(netAppDirPath, '../../../../');
  } else if (process.platform === 'linux') {
    return path.join(netAppDirPath, '../../');
  } else {
    throw new Error('Unexpected platform error.');
  }
}

/**
 * ソルバー実行用のハンドラの型です。
 */
type HandlerTypeToRunSolver = (
  event: any,
  graphData: string,
  stData: string,
  nodePositionData: string,
  problemName: string,
  stylesheet: Stylesheet[],
  numColors: number,
) => void;

/**
 * ソルバー実行用のハンドラを取得します。
 * @return {HandlerTypeToRunSolver} ソルバー実行用のハンドラ
 */
function getHandlerToRunSolver(): HandlerTypeToRunSolver {
  return (
    event: any,
    graphData: string,
    stData: string,
    nodePositionData: string,
    problemName: string,
    stylesheet: Stylesheet[],
    numColors: number,
  ) => {
    curProblemName = problemName;

    // 選択されたソルバーが登録されているか確認します。
    if (!solverInfoMap[settings.solver]) {
      dialog.showErrorBox(
        'エラー',
        `指定されたソルバーが登録されていません。\n* ソルバー名 : ${settings.solver}`,
      );
      mainWindow.webContents.send('solver-finished');
      return;
    }

    // 内蔵ソルバーの場合の処理です。
    if (settings.solver === BUILTIN_SOLVER_NAME) {
      runBuiltinSolver(
        graphData, stData, nodePositionData, problemName, stylesheet, numColors,
      );
      return;
    }

    // 外部ソルバーの場合の処理です。
    runExternalSolver(
      graphData, stData, nodePositionData, problemName, stylesheet, numColors,
    );
  };
}

/**
 * 内蔵ソルバー（IDA*）を Worker Thread で実行します。
 */
function runBuiltinSolver(
  graphData: string,
  stData: string,
  nodePositionData: string,
  problemName: string,
  stylesheet: Stylesheet[],
  numColors: number,
): void {
  // 内蔵ソルバーは vertex タイプのみ対応しています。
  const problemType = problemInfoMap[problemName].problemType;
  if (problemType !== 'vertex') {
    dialog.showErrorBox(
      'エラー',
      `内蔵ソルバー（IDA*）は vertex タイプの問題のみ対応しています。\n` +
      `現在の問題タイプ: ${problemType}`,
    );
    mainWindow.webContents.send('solver-finished');
    curProblemName = '';
    return;
  }

  // Worker Thread を使用してソルバーを実行します。
  const workerPath = path.join(__dirname, 'solver', 'idastar-worker.js');
  const worker = new Worker(workerPath, {
    workerData: {colText: graphData, datText: stData},
  });
  activeWorker = worker;
  ignoreErrorReport = false;

  // ソルバーの結果を受け取るハンドラです。
  worker.on('message', (stdout: string) => {
    activeWorker = null;
    mainWindow.webContents.send('solver-finished');
    createResultWindow(
      mainWindow,
      graphData,
      nodePositionData,
      stdout,
      problemInfoMap[curProblemName].problemType,
      stylesheet,
      numColors,
      () => {
        curProblemName = '';
      },
    );
    // macOS の場合は手動でメイン ウインドウを無効化します。
    if (process.platform === 'darwin') {
      mainWindow.setIgnoreMouseEvents(true);
    }
  });

  // エラー発生時のハンドラです。
  worker.on('error', (err: Error) => {
    activeWorker = null;
    if (!ignoreErrorReport) {
      dialog.showErrorBox(
        'エラー',
        `内蔵ソルバー実行中に以下のエラーが発生しました。\n\n${err.message}`,
      );
    }
    mainWindow.webContents.send('solver-finished');
    curProblemName = '';
  });

  // Worker が予期せず終了した場合のハンドラです。
  worker.on('exit', (code: number) => {
    if (code !== 0 && activeWorker !== null) {
      activeWorker = null;
      if (!ignoreErrorReport) {
        dialog.showErrorBox(
          'エラー',
          `内蔵ソルバーが異常終了しました。（終了コード: ${code}）`,
        );
      }
      mainWindow.webContents.send('solver-finished');
      curProblemName = '';
    }
  });
}

/**
 * 外部ソルバーを child_process で実行します。
 */
function runExternalSolver(
  graphData: string,
  stData: string,
  nodePositionData: string,
  problemName: string,
  stylesheet: Stylesheet[],
  numColors: number,
): void {
  // グラフ データ ファイルおよび開始位置、目標位置データ ファイルを作成します。
  fs.writeFileSync(graphColFile, graphData);
  fs.writeFileSync(stDataFile, stData);

  // ソルバーの実行ファイルのパスを取得します。
  const solverFilePath = solverInfoMap[settings.solver].path;

  // ソルバーの実行ファイルが見つからなかった場合はエラー ボックスを表示して終了します。
  if (!fs.existsSync(solverFilePath)) {
    dialog.showErrorBox(
      'エラー',
      `ソルバーの実行ファイルが見つかりませんでした。\n* ファイル パス : ${solverFilePath}`,
    );
    mainWindow.webContents.send('solver-finished');
    fs.unlinkSync(graphColFile);
    fs.unlinkSync(stDataFile);
    processId = null;
    return;
  }

  // ソルバーを実行します。
  const solverProcess = childProcess.exec(
    `${solverFilePath} ${graphColFile} ${problemInfoMap[problemName].args} ${
      solverInfoMap[settings.solver].args
    } --stfile=${stDataFile}`,
    // エラーが発生した場合はエラー ボックスを表示します。
    (err, stdout, stderr) => {
      if (err) {
        if (!ignoreErrorReport) {
          dialog.showErrorBox(
            'エラー',
            `ソルバー実行中に以下のエラーが発生しました。\n\n${stderr}`,
          );
        }
        // ソルバー完了を表すイベントを発生させます。
        mainWindow.webContents.send('solver-finished');
        // ソルバーの入力ファイルを削除します。
        fs.unlinkSync(graphColFile);
        fs.unlinkSync(stDataFile);
        processId = null;
        curProblemName = '';
        return;
      }
      // ソルバーの実行に成功した場合は出力結果ウィンドウを開きます。
      else {
        mainWindow.webContents.send('solver-finished');
        createResultWindow(
          mainWindow,
          graphData,
          nodePositionData,
          stdout,
          problemInfoMap[curProblemName].problemType,
          stylesheet,
          numColors,
          () => {
            curProblemName = '';
          },
        );
        // ソルバーの入力ファイルを削除します。
        fs.unlinkSync(graphColFile);
        fs.unlinkSync(stDataFile);
        processId = null;
        // macOS の場合は手動でメイン ウインドウを無効化します。
        if (process.platform === 'darwin') {
          mainWindow.setIgnoreMouseEvents(true);
        }
      }
    },
  );
  // ソルバー プロセスの ID を更新します。
  processId = solverProcess.pid === undefined ? null : solverProcess.pid;
}
