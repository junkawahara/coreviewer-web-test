import React from 'react';

import { MainWindow } from './components/MainWindow';
import { GraphDataProvider } from './components/GraphDataProvider';

// メイン ウインドウを実行するためのアプリケーション コンポーネントを作成します。
const MainApp = () => {
  return (
    <GraphDataProvider>
      <MainWindow />
    </GraphDataProvider>
  );
};

export default MainApp;
