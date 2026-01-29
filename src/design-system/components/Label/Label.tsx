import FormLabel, { FormLabelProps } from '@mui/material/FormLabel';
import type { SxProps, Theme } from '@mui/material/styles';
import React from 'react';

export interface LabelProps extends Omit<FormLabelProps, 'sx'> {
  /**
   * Текст или содержимое метки
   */
  children: React.ReactNode;
  /**
   * id поля, с которым связывается метка (для доступности)
   */
  htmlFor?: string;
  /**
   * Обязательное поле (показывает * после текста)
   */
  required?: boolean;
  /**
   * Дополнительные стили (мержатся с дефолтными mb: 1, color: 'text.secondary')
   */
  sx?: SxProps<Theme>;
}

const defaultSx: SxProps<Theme> = {
  mb: 1,
  color: 'text.secondary',
};

/**
 * Метка для полей формы. Оборачивает MUI FormLabel с дизайн-системными стилями по умолчанию.
 * Используйте над полями ввода, селектами и т.п. Для Switch/Checkbox — FormControlLabel.
 *
 * @example
 * ```tsx
 * <Label htmlFor="email"><Trans>Email</Trans></Label>
 * <OutlinedInput id="email" />
 *
 * <Label><Trans>Reward(s) to claim</Trans></Label>
 * <Select>...</Select>
 * ```
 */
export const DesignSystemLabel: React.FC<LabelProps> = ({
  children,
  htmlFor,
  required = false,
  sx,
  ...props
}) => {
  return (
    <FormLabel
      htmlFor={htmlFor}
      required={required}
      sx={[defaultSx, sx].filter(Boolean) as FormLabelProps['sx']}
      {...props}
    >
      {children}
    </FormLabel>
  );
};

export default DesignSystemLabel;
