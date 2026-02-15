import {
  readProblemInfo,
  readSettingFile,
  readSolverListFile,
} from './DataFunctions';

/**
 * 問題情報ファイルを読み込む関数のテストです。
 * 読み込みに成功する場合です。
 */
test('readProblemInfoSuccessfully ', () => {
  const filePath =
    './data/unit_test/data_functions/problem_list_read_problemInfo_successfully.csv';
  // 問題リスト ファイルを読み込みます。
  const [problemInfoMap, error] = readProblemInfo(filePath);
  // エラーが生じていないことを確認します。
  expect(error).toBe('');
  // 1 つめの問題情報の内容を確認します。
  const problemInfo1 = problemInfoMap['Vertex-Mode1'];
  expect(problemInfo1.displayName).toBe('Vertex-Mode1');
  expect(problemInfo1.problemType).toBe('vertex');
  expect(problemInfo1.args).toBe('--indset --st');
  // 2 つめの問題情報の内容を確認します。
  const problemInfo2 = problemInfoMap['Edge-Mode1'];
  expect(problemInfo2.displayName).toBe('Edge-Mode1');
  expect(problemInfo2.problemType).toBe('edge');
  expect(problemInfo2.args).toBe('');
});

/**
 * 問題情報ファイルを読み込む関数のテストです。
 * 空行がある場合です。
 */
test('readProblemInfoWithEmptyLineSuccessfully ', () => {
  const filePath =
    './data/unit_test/data_functions/problem_list_with_empty_line.csv';
  // 問題リスト ファイルを読み込みます。
  const [problemInfoMap, error] = readProblemInfo(filePath);
  // エラーが生じていないことを確認します。
  expect(error).toBe('');
  // 1 つめの問題情報の内容を確認します。
  const problemInfo1 = problemInfoMap['Vertex-Mode1'];
  expect(problemInfo1.displayName).toBe('Vertex-Mode1');
  expect(problemInfo1.problemType).toBe('vertex');
  expect(problemInfo1.args).toBe('--indset --st');
  // 2 つめの問題情報の内容を確認します。
  const problemInfo2 = problemInfoMap['Edge-Mode1'];
  expect(problemInfo2.displayName).toBe('Edge-Mode1');
  expect(problemInfo2.problemType).toBe('edge');
  expect(problemInfo2.args).toBe('foo');
});

/**
 * 問題情報ファイルを読み込む関数のテストです。
 * ファイルが存在しない場合です。
 */
test('failToReadProblemInfoWhenFileDidNotExisst', () => {
  const filePath = './data/unit_test/data_functions/problem_list_bar.csv';
  // 問題リスト ファイルを読み込みます。
  const [problemInfoMap, error] = readProblemInfo(filePath);
  // エラー メッセージを確認します。
  expect(error).toBe(
    '問題リスト ファイル (problem_list.csv) が見つかりませんでした。',
  );
});

/**
 * 問題情報ファイルを読み込む関数のテストです。
 * 問題タイプが指定されていない行がある場合です。
 */
test('failToReadProblemInfoWhenProblemTypeDidNotSpecified', () => {
  const filePath =
    './data/unit_test/data_functions/problem_list_fail_to_read_problem_type_not_specified.csv';
  // 問題リスト ファイルを読み込みます。
  const [problemInfoMap, error] = readProblemInfo(filePath);
  // エラー メッセージを確認します。
  expect(error).toBe(
    `問題タイプが指定されていません。\n* ファイルパス : ${filePath}\n* 行番号 : 2`,
  );
});

/**
 * 問題情報ファイルを読み込む関数のテストです。
 * 不正な問題タイプが指定された行がある場合です。
 */
test('failToReadProblemInfoWhenInvalidProblemTypeSpecified', () => {
  const filePath =
    './data/unit_test/data_functions/problem_list_fail_to_read_invalid_type_specified.csv';
  // 問題リスト ファイルを読み込みます。
  const [problemInfoMap, error] = readProblemInfo(filePath);
  // エラー メッセージを確認します。
  expect(error).toBe(
    `問題タイプが不正です。\n* ファイルパス : ${filePath}\n* 行番号 : 2`,
  );
});

/**
 * 問題情報ファイルを読み込む関数のテストです。
 * 複数行で同じ表示名が指定されている場合です。
 */
test('failToReadProblemInfoWhenSameNameIsSpecifiedOnMultipleLines', () => {
  const filePath =
    './data/unit_test/data_functions/problem_list_fail_to_read_same_name_specified.csv';
  // 問題リスト ファイルを読み込みます。
  const [problemInfoMap, error] = readProblemInfo(filePath);
  // エラー メッセージを確認します。
  expect(error).toBe(
    `問題 Edge-Mode1 が複数行で設定されています。\n* ファイルパス : ${filePath}`,
  );
});

/**
 * ソルバー リスト ファイルを読み込む関数のテストです。
 * 読み込みに成功する場合です。
 */
test('readSolverListFileSuccessfully ', () => {
  const filePath =
    './data/unit_test/data_functions/solver_list_read_solver_list_successfully.csv';
  // 問題リスト ファイルを読み込みます。
  const [solverInfoMap, error] = readSolverListFile(filePath, 'C:/');
  // エラーが生じていないことを確認します。
  expect(error).toBe('');
  // 1 つめのソルバー情報の内容を確認します。
  const solverInfo1 = solverInfoMap['solverA'];
  expect(solverInfo1.name).toBe('solverA');
  expect(solverInfo1.path).toBe('C:/solver/solver_a.exe');
  expect(solverInfo1.args).toBe('');
  // 2 つめのソルバー情報の内容を確認します。
  const solverInfo2 = solverInfoMap['solverB'];
  expect(solverInfo2.name).toBe('solverB');
  expect(solverInfo2.path).toBe('C:/solver/solver_b.exe');
  expect(solverInfo2.args).toBe('paramB1 paramB2');
});

/**
 * ソルバー リスト ファイルを読み込む関数のテストです。
 * 空行がある場合です。
 */
test('readSolverListWithEmptyLine', () => {
  const filePath =
    './data/unit_test/data_functions/solver_list_with_empty_line.csv';
  // 問題リスト ファイルを読み込みます。
  const [solverInfoMap, error] = readSolverListFile(filePath, 'C:/');
  // エラーが生じていないことを確認します。
  expect(error).toBe('');
  // 1 つめのソルバー情報の内容を確認します。
  const solverInfo1 = solverInfoMap['solverA'];
  expect(solverInfo1.name).toBe('solverA');
  expect(solverInfo1.path).toBe('C:/solver/solver_a.exe');
  expect(solverInfo1.args).toBe('paramA');
  // 2 つめのソルバー情報の内容を確認します。
  const solverInfo2 = solverInfoMap['solverB'];
  expect(solverInfo2.name).toBe('solverB');
  expect(solverInfo2.path).toBe('C:/solver/solver_b.exe');
  expect(solverInfo2.args).toBe('paramB1 paramB2');
});

/**
 * ソルバー リスト ファイルを読み込む関数のテストです。
 * ファイルが存在しない場合です。
 */
test('failToReadSolverListWhenFileDidNotExist', () => {
  const filePath = './data/unit_test/data_functions/solver_list_bar.csv';
  // 問題リスト ファイルを読み込みます。
  const [solverInfoMap, error] = readSolverListFile(filePath, 'C:/');
  // エラーが生じていないことを確認します。
  expect(error).toBe(
    'ソルバー リスト ファイル (solver_list.csv) が見つかりませんでした。',
  );
});

/*
 * ソルバー リスト ファイルを読み込む関数のテストです。
 * 複数行で同じソルバー名が指定されている場合です。
 */
test('failToReadSolverListWhenSameNameIsSpecifiedOnMultipleLines', () => {
  const filePath =
    './data/unit_test/data_functions/solver_list_fail_to_read_same_name_specified.csv';
  // 問題リスト ファイルを読み込みます。
  const [solverInfoMap, error] = readSolverListFile(filePath, 'C:/');
  // エラーが生じていないことを確認します。
  expect(error).toBe(
    `ソルバー solverA が複数行で設定されています。\n* ファイルパス : ${filePath}`,
  );
});

/**
 * 設定ファイルを読み込む関数のテストです。
 * ファイルに全ての項目が設定されている場合です。
 */
test('readCompleteSettingFile', () => {
  const filePath = './data/unit_test/data_functions/config_complete.xml';
  // 問題リスト ファイルを読み込みます。
  const [settings, error] = readSettingFile(filePath);
  // エラーが生じていないことを確認します。
  expect(error).toBeNull();
  // 読み込んだ内容を確認します。
  expect(settings.solver).toBe('solverA');
});

/**
 * 設定ファイルを読み込む関数のテストです。
 * 設定ファイルが存在しない場合です。
 */
test('readSettingFileWhenFileDidNotExist', () => {
  const filePath = './data/unit_test/data_functions/config_1.xml';
  // 問題リスト ファイルを読み込みます。
  const [settings, error] = readSettingFile(filePath);
  // エラーが生じていないことを確認します。
  expect(error).toBeNull();
  // 読み込んだ内容を確認します。
  expect(settings.solver).toBe('');
});

/**
 * 設定ファイルを読み込む関数のテストです。
 * ソルバー要素が存在しない場合です。
 */
test('readSettingFileWithoutSolver', () => {
  const filePath = './data/unit_test/data_functions/config_without_solver.xml';
  // 問題リスト ファイルを読み込みます。
  const [settings, error] = readSettingFile(filePath);
  // エラーが生じていないことを確認します。
  expect(error).toBeNull();
  // 読み込んだ内容を確認します。
  expect(settings.solver).toBe('');
});
