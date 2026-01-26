import Switch, { SwitchProps as MuiSwitchProps } from '@mui/material/Switch';
import React from 'react';

export interface SwitchProps extends Omit<MuiSwitchProps, 'size'> {
  /**
   * Размер переключателя
   * - medium: Стандартный размер (по умолчанию)
   * - small: Маленький размер
   */
  size?: 'small' | 'medium';
  /**
   * Состояние переключателя
   */
  checked?: boolean;
  /**
   * Обработчик изменения состояния
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  /**
   * Состояние disabled
   */
  disabled?: boolean;
  /**
   * Цвет переключателя
   */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default';
  /**
   * Отключить ripple эффект
   */
  disableRipple?: boolean;
}

/**
 * Компонент Switch из дизайн-системы
 *
 * @example
 * ```tsx
 * // Базовое использование
 * <Switch checked={enabled} onChange={handleChange} />
 *
 * // С цветом
 * <Switch checked={enabled} color="primary" />
 *
 * // Disabled состояние
 * <Switch checked={enabled} disabled />
 * ```
 */
export const DesignSystemSwitch: React.FC<SwitchProps> = (props) => {
  return <Switch {...props} />;
};

export default DesignSystemSwitch;
