import {Stylesheet} from 'cytoscape';
import {PlatformAPI} from './PlatformAPI';
import {Settings, getDefaultSettings, BUILTIN_SOLVER_NAME} from '../Settings';
import {problemListData} from './problemListData';

/**
 * Web 版のプラットフォーム アダプターを作成します。
 * ブラウザ API (File API, Web Worker, localStorage) を使用して
 * Electron 版と同等の機能を提供します。
 * @return {PlatformAPI} Web 版のプラットフォーム API
 */
export function createWebAdapter(): PlatformAPI {
  // イベント ハンドラを管理するマップです。
  const handlers: Map<string, ((...args: any[]) => void)[]> = new Map();
  // ドロップされたファイルを保存するマップです。
  const fileStore: Map<string, File> = new Map();
  // アクティブな Web Worker の参照です。
  let activeWorker: Worker | null = null;
  // 現在の設定です。
  let currentSettings: Settings = loadSettings();

  /**
   * イベント ハンドラを登録します。
   */
  function on(channel: string, func: (...args: any[]) => void): void {
    if (!handlers.has(channel)) {
      handlers.set(channel, []);
    }
    handlers.get(channel)!.push(func);
  }

  /**
   * イベントを発火します。
   */
  function emit(channel: string, ...args: any[]): void {
    const fns = handlers.get(channel);
    if (fns) {
      fns.forEach(fn => fn(...args));
    }
  }

  /**
   * localStorage から設定を読み込みます。
   */
  function loadSettings(): Settings {
    try {
      const stored = localStorage.getItem('reconf-solver-settings');
      if (stored) {
        return JSON.parse(stored) as Settings;
      }
    } catch (e) {
      // 読み込みに失敗した場合はデフォルト設定を使用します。
    }
    return getDefaultSettings();
  }

  // React マウント後に問題情報と設定を送信します。
  setTimeout(() => {
    emit('send-problem-info', null, problemListData);
    const solvers = [BUILTIN_SOLVER_NAME];
    emit('send-settings', null, currentSettings, solvers, 'MainWindow');
    emit('send-settings', null, currentSettings, solvers, 'SettingWindow');
  }, 0);

  const api: PlatformAPI = {
    openFileDialog(): Promise<[string, string]> {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.col,.dat,.txt';
        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) {
            resolve(['', '']);
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            resolve([file.name, reader.result as string]);
          };
          reader.onerror = () => {
            resolve(['', '']);
          };
          reader.readAsText(file);
        };
        // キャンセル時の処理です。
        input.addEventListener('cancel', () => {
          resolve(['', '']);
        });
        input.click();
      });
    },

    readFile(filePath: string): Promise<string> {
      return new Promise((resolve, reject) => {
        const file = fileStore.get(filePath);
        if (!file) {
          reject(new Error(`ファイルが見つかりません: ${filePath}`));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          reject(new Error(`ファイルの読み込みに失敗しました: ${filePath}`));
        };
        reader.readAsText(file);
      });
    },

    showErrorBox(title: string, message: string): void {
      window.alert(`${title}\n${message}`);
    },

    runSolver(
      graphData: string,
      stData: string,
      nodePositionData: string,
      problemName: string,
      stylesheet: Stylesheet[],
      numColors: number,
    ): void {
      // 問題リストから問題タイプを取得します。
      const problemInfo = problemListData[problemName];
      const problemType = problemInfo ? problemInfo.problemType : '';

      // vertex タイプ以外はエラーを表示します。
      if (problemType !== 'vertex') {
        api.showErrorBox(
          'エラー',
          '内蔵ソルバーは vertex タイプの問題のみに対応しています。',
        );
        emit('solver-finished');
        return;
      }

      // Web Worker でソルバーを実行します。
      activeWorker = new Worker(
        new URL('../solver/idastar-web-worker.ts', import.meta.url),
      );

      activeWorker.onmessage = (event: MessageEvent) => {
        const result = event.data as string;
        emit(
          'send-data',
          null,
          graphData,
          nodePositionData,
          result,
          problemType,
          stylesheet,
          numColors,
        );
        emit('solver-finished');
        activeWorker = null;
      };

      activeWorker.onerror = (error: ErrorEvent) => {
        api.showErrorBox(
          'ソルバー エラー',
          `ソルバーの実行中にエラーが発生しました。\n${error.message}`,
        );
        emit('solver-finished');
        activeWorker = null;
      };

      activeWorker.postMessage({colText: graphData, datText: stData});
    },

    cancelSolver(): void {
      if (activeWorker) {
        activeWorker.terminate();
        activeWorker = null;
        emit('solver-finished');
      }
    },

    saveSetting(settings: Settings): void {
      currentSettings = settings;
      try {
        localStorage.setItem(
          'reconf-solver-settings',
          JSON.stringify(settings),
        );
      } catch (e) {
        // localStorage への書き込みに失敗した場合は無視します。
      }
      const solvers = [BUILTIN_SOLVER_NAME];
      emit('send-settings', null, settings, solvers, 'MainWindow');
      emit('send-settings', null, settings, solvers, 'SettingWindow');
    },

    saveData(outputData: string, outputType: string): void {
      const blob = new Blob([outputData], {type: 'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `output_${outputType}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    saveImage(outputImages: string[], outputType: string): void {
      outputImages.forEach((base64, index) => {
        if (!base64) return;
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {type: 'image/png'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `graph_${outputType}_${index}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    },

    onSolverFinished(func: (...args: any[]) => void): void {
      on('solver-finished', func);
    },

    onProblemInfoSend(func: (...args: any[]) => void): void {
      on('send-problem-info', func);
    },

    onDataSend(func: (...args: any[]) => void): void {
      on('send-data', func);
    },

    onSettingsSend(func: (...args: any[]) => void): void {
      on('send-settings', func);
    },

    onOutputDataRequired(func: (...args: any[]) => void): void {
      on('require-output-data', func);
    },

    onOutputImageRequired(func: (...args: any[]) => void): void {
      on('require-output-image', func);
    },

    removeHandler(channel: string): void {
      handlers.delete(channel);
    },

    storeDroppedFile(file: File): void {
      fileStore.set(file.name, file);
    },
  };

  return api;
}
