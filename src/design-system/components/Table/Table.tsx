import {
  type TableProps as MuiTableProps,
  Table as MuiTable,
  TableBody as MuiTableBody,
  TableCell as MuiTableCell,
  TableContainer as MuiTableContainer,
  TableHead as MuiTableHead,
  TableRow as MuiTableRow,
} from '@mui/material';
import React from 'react';

export { tableCellClasses } from '@mui/material/TableCell';

export type TableContainerProps = React.ComponentProps<typeof MuiTableContainer>;
export type TableProps = MuiTableProps;
export type TableHeadProps = React.ComponentProps<typeof MuiTableHead>;
export type TableBodyProps = React.ComponentProps<typeof MuiTableBody>;
export type TableRowProps = React.ComponentProps<typeof MuiTableRow>;
export type TableCellProps = React.ComponentProps<typeof MuiTableCell>;

/**
 * Обёртка над таблицей. При `maxHeight` в `sx` включает вертикальную прокрутку.
 * Используйте вместе с `Table`, `TableHead`, `TableBody`, `TableRow`, `TableCell`.
 */
export const DesignSystemTableContainer: React.FC<TableContainerProps> = (props) => {
  return <MuiTableContainer {...props} />;
};

export interface DesignSystemTableProps extends Omit<MuiTableProps, 'size'> {
  /**
   * Размер таблицы.
   * - small: компактный вид (по умолчанию)
   * - medium: стандартный
   */
  size?: 'small' | 'medium';
}

/**
 * Корневой элемент таблицы. По умолчанию `size="small"`.
 * Используйте с `stickyHeader` при прокрутке в `TableContainer` для фиксированного заголовка.
 */
export const DesignSystemTable: React.FC<DesignSystemTableProps> = ({
  size = 'small',
  ...props
}) => {
  return <MuiTable size={size} {...props} />;
};

/**
 * Блок заголовков колонок (thead).
 * Внутри используйте `TableRow` и `TableCell` (часто с `Typography variant="helperText"`).
 */
export const DesignSystemTableHead: React.FC<TableHeadProps> = (props) => {
  return <MuiTableHead {...props} />;
};

/**
 * Блок строк с данными (tbody).
 */
export const DesignSystemTableBody: React.FC<TableBodyProps> = (props) => {
  return <MuiTableBody {...props} />;
};

/**
 * Строка таблицы (tr). Используется в `TableHead` и `TableBody`.
 */
export const DesignSystemTableRow: React.FC<TableRowProps> = (props) => {
  return <MuiTableRow {...props} />;
};

/**
 * Ячейка таблицы (td / th).
 * `align`: left | center | right. Для числовых колонок — right.
 */
export const DesignSystemTableCell: React.FC<TableCellProps> = (props) => {
  return <MuiTableCell {...props} />;
};

export default DesignSystemTable;
