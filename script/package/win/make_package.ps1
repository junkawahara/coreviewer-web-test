
# electron-builder を実行します。
npx electron-builder

$packageDir = "./package_release/win-unpacked/"

# solver ディレクトリをコピーします。
Copy-Item ./solver/ $packageDir  -Force -Recurse

# ライセンス ファイルをコピーします。
Copy-Item ./LICENSE $packageDir -Force

# 問題リスト ファイルをコピーします。
Copy-Item ./problem_list.csv $packageDir -Force

# ソルバー リスト ファイルをコピーします。
Copy-Item ./solver_list.csv $packageDir -Force

# 設定ファイルをコピーします。
Copy-Item ./config.xml $packageDir -Force

