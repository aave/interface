import { CircularProgress } from '@mui/material';
import Button, { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import React from 'react';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  /**
   * Вариант кнопки
   * - contained: Основная кнопка с заливкой
   * - outlined: Кнопка с обводкой
   * - text: Текстовая кнопка
   * - surface: Кнопка с поверхностным фоном
   * - gradient: Кнопка с градиентным фоном
   */
  variant?: 'contained' | 'outlined' | 'text' | 'surface' | 'gradient';
  /**
   * Размер кнопки
   * - large: Большая кнопка (buttonL типографика, padding 10px 24px)
   * - medium: Средняя кнопка (buttonM типографика, padding 6px 12px)
   * - small: Маленькая кнопка (buttonS типографика, padding 0 6px)
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Цвет кнопки
   */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  /**
   * Состояние загрузки
   * При true показывает CircularProgress и делает кнопку disabled
   */
  loading?: boolean;
  /**
   * Текст, отображаемый во время загрузки
   */
  loadingText?: string;
  /**
   * Дочерние элементы
   */
  children: React.ReactNode;
}

/**
 * Компонент Button из дизайн-системы
 *
 * @example
 * ```tsx
 * // Основная кнопка
 * <Button variant="contained" onClick={handleClick}>
 *   Подтвердить
 * </Button>
 *
 * // Кнопка с загрузкой
 * <Button variant="contained" loading={isLoading}>
 *   Отправить
 * </Button>
 *
 * // Кнопка с градиентом
 * <Button variant="gradient" size="large">
 *   Создать
 * </Button>
 * ```
 */
export const DesignSystemButton: React.FC<ButtonProps> = ({
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}) => {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      startIcon={
        loading ? (
          <CircularProgress color="inherit" size={16} sx={{ mr: loadingText ? 1 : 0 }} />
        ) : (
          props.startIcon
        )
      }
    >
      {loading && loadingText ? loadingText : children}
    </Button>
  );
};

export default DesignSystemButton;
