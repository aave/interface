/**
 * Barrel export для компонентов дизайн-системы
 *
 * Использование:
 * import { Button, Switch } from 'src/design-system/components';
 */

export type { ButtonProps } from './Button/Button';
export { DesignSystemButton as Button, default as ButtonDefault } from './Button/Button';
export type { SwitchProps } from './Switch/Switch';
export { DesignSystemSwitch as Switch, default as SwitchDefault } from './Switch/Switch';
