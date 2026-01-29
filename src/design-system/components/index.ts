/**
 * Barrel export для компонентов дизайн-системы
 *
 * Использование:
 * import { Button, Switch, Table, TableContainer, Label } from 'src/design-system/components';
 */

export type { ButtonProps } from './Button/Button';
export { DesignSystemButton as Button, default as ButtonDefault } from './Button/Button';
export type { LabelProps } from './Label/Label';
export { DesignSystemLabel as Label, default as LabelDefault } from './Label/Label';
export type { SwitchProps } from './Switch/Switch';
export { DesignSystemSwitch as Switch, default as SwitchDefault } from './Switch/Switch';
export type {
  DesignSystemTableProps,
  TableBodyProps,
  TableCellProps,
  TableContainerProps,
  TableHeadProps,
  TableProps,
  TableRowProps,
} from './Table/Table';
export {
  DesignSystemTable as Table,
  DesignSystemTableBody as TableBody,
  DesignSystemTableCell as TableCell,
  tableCellClasses,
  DesignSystemTableContainer as TableContainer,
  DesignSystemTableHead as TableHead,
  DesignSystemTableRow as TableRow,
} from './Table/Table';
export { default as TableDefault } from './Table/Table';
