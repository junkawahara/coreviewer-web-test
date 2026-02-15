/** @jsxImportSource @emotion/react */

import React, {useEffect, useState} from 'react';
import {css} from '@emotion/react';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';

import {MainWindow} from './components/MainWindow';
import {ResultWindow} from './components/ResultWindow';
import {SettingWindow} from './components/SettingWindow';
import {GraphDataProvider} from './components/GraphDataProvider';
import {usePlatform} from './platform/PlatformContext';

// Web 版アプリケーションのシェル コンポーネントです。
// シングルページで、結果と設定をモーダルとして表示します。
export const WebApp = () => {
  const [showResult, setShowResult] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const platform = usePlatform();

  // solver 完了時に result モーダルを表示します。
  useEffect(() => {
    platform.onDataSend(() => setShowResult(true));
  }, []);

  return (
    <GraphDataProvider>
      <MainWindow onShowSettings={() => setShowSettings(true)} />
      {/* 結果モーダルです。 */}
      <Dialog
        open={showResult}
        onClose={() => setShowResult(false)}
        maxWidth="lg"
        fullWidth>
        <div css={dialogContentCss}>
          <ResultWindow />
        </div>
      </Dialog>
      {/* 設定モーダルです。 */}
      <Dialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        maxWidth="md"
        fullWidth>
        <div css={settingsDialogCss}>
          <SettingWindow onClose={() => setShowSettings(false)} />
        </div>
      </Dialog>
    </GraphDataProvider>
  );
};

// 結果ダイアログのコンテンツ スタイルです。
const dialogContentCss = css`
  padding: 16px;
  min-height: 500px;
`;

// 設定ダイアログのコンテンツ スタイルです。
const settingsDialogCss = css`
  padding: 16px;
  min-height: 400px;
`;
