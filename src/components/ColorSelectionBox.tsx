/** @jsxImportSource @emotion/react */

import React, { ReactNode } from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { SelectChangeEvent } from '@mui/material';

/**
 * 色選択コンポーネントのプロパティです。
 */
type ColorSelectionProps = {
  colorValue: string;
  changeHandler: (event: SelectChangeEvent<any>, child: ReactNode) => void;
};

// 選択可能な色の一覧です。
const colors: string[] = [
  'Black',
  'Silver',
  'Gray',
  'White',
  'Maroon',
  'Red',
  'Purple',
  'Fuchsia',
  'Green',
  'Lime',
  'Olive',
  'Yellow',
  'Navy',
  'Blue',
  'Teal',
  'Aqua',
  'Orange',
  'Cyan',
];

// 色を選択するためのコンポーネントです。
export const ColorSelectionBox = (props: ColorSelectionProps) => {
  const { colorValue, changeHandler } = props;
  // コンボ ボックスを表す要素を作成します。
  return (
    <Select
      style={{ width: '100%' }}
      value={colorValue}
      onChange={changeHandler}>
      {colors.map(color => {
        return (
          <MenuItem sx={{ bgcolor: color }} key={color} value={color}>
            {color}
          </MenuItem>
        );
      })}
    </Select>
  );
};
