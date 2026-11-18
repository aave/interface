import { TextWithTooltipProps } from 'src/components/TextWithTooltip';

export const tooltipLabelProps: Pick<TextWithTooltipProps, 'iconSize' | 'variant' | 'textColor'> = {
  iconSize: 16,
  variant: 'description',
  textColor: 'fg-3',
};
