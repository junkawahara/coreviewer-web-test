import { PlatformAPI } from './PlatformAPI';

/**
 * Electron 版のプラットフォーム アダプターを作成します。
 * preload.ts で設定された window.apiData をそのまま返します。
 * @return {PlatformAPI} Electron 版のプラットフォーム API
 */
export function createElectronAdapter(): PlatformAPI {
  return window.apiData as unknown as PlatformAPI;
}
