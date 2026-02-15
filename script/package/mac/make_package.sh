#!/bin/bash

# electron-builder を実行します。
npx electron-builder

# ソルバーをパッケージ内にコピーします。
cp -rf ./solver package_release/mac/ 

# ライセンスをパッケージ内にコピーします。
cp -f ./LICENSE package_release/mac/ 

# 問題リスト ファイルをパッケージ内にコピーします。
cp -f ./problem_list.csv package_release/mac/ 

# ソルバー リスト ファイルをパッケージ内にコピーします。
cp -f ./solver_list.csv package_release/mac/ 

# 設定ファイルをパッケージ内にコピーします。
cp -f ./config.xml package_release/mac/ 
