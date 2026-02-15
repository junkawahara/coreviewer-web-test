import React from 'react';
import ReactDOM from 'react-dom';

import {WebApp} from './WebApp';
import {PlatformProvider} from './platform/PlatformContext';
import {createWebAdapter} from './platform/WebAdapter';

// Web 版のプラットフォーム API を作成します。
const api = createWebAdapter();

// Web 版アプリケーションをレンダリングします。
const rootDom = document.getElementById('root');
if (rootDom) {
  ReactDOM.render(
    <PlatformProvider api={api}>
      <WebApp />
    </PlatformProvider>,
    rootDom,
  );
}
