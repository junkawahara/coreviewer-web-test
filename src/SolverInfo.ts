// ソルバーの情報を保持する型です。
export type SolverInfo = {
  name: string;
  path: string;
  args: string;
};

// ソルバーの情報のマップ型です。
// キーは問題の表示名で、値はキーに対応するソルバーの情報です。
export type SolverInfoMap = {
  [key: string]: SolverInfo;
};
