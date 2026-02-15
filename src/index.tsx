import React from 'react';
import ReactDOM from 'react-dom';

import MainApp from './MainApp';
import ResultApp from './ResultApp';
import SettingApp from './SettingApp';
import { PlatformProvider } from './platform/PlatformContext';
import { createElectronAdapter } from './platform/ElectronAdapter';

// Electron 版のプラットフォーム API を作成します。
const api = createElectronAdapter();

// メイン ウインドウのコンポーネントを読み込みます。
const rootDom = document.getElementById('root');
if (rootDom) {
  ReactDOM.render(
    <PlatformProvider api={api}>
      <MainApp />
    </PlatformProvider>,
    rootDom,
  );
}

// 出力結果ウインドウのコンポーネントを読み込みます。
const resultRootDom = document.getElementById('result_root');
if (resultRootDom) {
  ReactDOM.render(
    <PlatformProvider api={api}>
      <ResultApp />
    </PlatformProvider>,
    resultRootDom,
  );
}

// 設定ウインドウのコンポーネントを読み込みます。
const settingRootDom = document.getElementById('setting_root');
if (settingRootDom) {
  ReactDOM.render(
    <PlatformProvider api={api}>
      <SettingApp />
    </PlatformProvider>,
    settingRootDom,
  );
}
