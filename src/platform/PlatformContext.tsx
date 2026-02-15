import React, { createContext, useContext } from 'react';
import { PlatformAPI } from './PlatformAPI';

// プラットフォーム API を保持するコンテキストです。
const PlatformContext = createContext<PlatformAPI>({} as PlatformAPI);

/**
 * プラットフォーム API を取得するフックです。
 * @return {PlatformAPI} プラットフォーム API
 */
export const usePlatform = () => useContext(PlatformContext);

/**
 * プラットフォーム API のプロバイダーのプロパティです。
 */
type PlatformProviderProps = {
  api: PlatformAPI;
  children: React.ReactNode;
};

/**
 * プラットフォーム API をコンポーネント ツリーに提供するプロバイダーです。
 * @param {PlatformProviderProps} props プロバイダーのプロパティ
 * @return {JSX.Element} プロバイダー要素
 */
export const PlatformProvider = ({ api, children }: PlatformProviderProps) => (
  <PlatformContext.Provider value={api}>{children}</PlatformContext.Provider>
);
