// 組合せ遷移問題の情報です。
export type ProblemInfo = {
  displayName: string;
  problemType: string;
  args: string;
};

// 組合せ遷移問題の情報のマップです。
// キーは問題の表示名で、値はキーに対応する問題の情報です。
export type ProblemInfoMap = {
  [key: string]: ProblemInfo;
};
