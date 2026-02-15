// Web Worker 版ソルバーエントリポイントです。
// ブラウザの Web Worker 環境で動作します。
import {solve, formatOutput} from './idastar';

// メインスレッドからのメッセージを受信してソルバーを実行します。
self.onmessage = (event: MessageEvent) => {
  const {colText, datText} = event.data;
  const result = solve(colText, datText);
  (self as any).postMessage(formatOutput(result));
};
