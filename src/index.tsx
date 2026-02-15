import React from 'react';
import ReactDOM from 'react-dom';

import MainApp from './MainApp';
import ResultApp from './ResultApp';
import SettingApp from './SettingApp';

// メイン ウインドウのコンポーネントを読み込みます。
const rootDom = document.getElementById('root');
if (rootDom) {
  ReactDOM.render(<MainApp />, rootDom);
}

// 出力結果ウインドウのコンポーネントを読み込みます。
const resultRootDom = document.getElementById('result_root');
if (resultRootDom) {
  ReactDOM.render(<ResultApp />, resultRootDom);
}

// 設定ウインドウのコンポーネントを読み込みます。
const settingRootDom = document.getElementById('setting_root');
if (settingRootDom) {
  ReactDOM.render(<SettingApp />, settingRootDom);
}
