import {parentPort, workerData} from 'worker_threads';
import {solve, formatOutput} from './idastar';

// workerData から入力テキストを受け取ります。
const {colText, datText} = workerData as {colText: string; datText: string};

// ソルバーを実行します。
const result = solve(colText, datText);

// 結果をフォーマットしてメイン スレッドに送信します。
parentPort?.postMessage(formatOutput(result));
