import { TypographyProps } from '@mui/material';
import { FigmaColorName } from 'src/utils/figmaColors';

type TypographyVariant = TypographyProps['variant'];

// The typography variants enabled in the theme. The default MUI variants
// (body1/body2/button/subtitle*/h6/overline) are disabled in theme.tsx, so
// they are intentionally omitted here.
export const TYPOGRAPHY_VARIANTS: TypographyVariant[] = [
  'display1',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'subheader1',
  'subheader2',
  'description',
  'caption',
  'secondary21',
  'secondary16',
  'main12',
  'buttonL',
  'buttonM',
  'buttonS',
  'helperText',
];

// Figma color tokens grouped for the swatch grid. Names are keys of `figmaLight`
// (the shared subset), so each resolves in both light and dark via the flattened palette tokens.
export const SWATCH_GROUPS: { title: string; names: FigmaColorName[] }[] = [
  { title: 'Backgrounds', names: ['bg-max', 'bg-1', 'bg-2', 'bg-3', 'bg-4', 'bg-5', 'bg-6'] },
  { title: 'Foreground / Text', names: ['fg-max', 'fg-1', 'fg-2', 'fg-3', 'fg-4', 'fg-5'] },
  { title: 'Borders', names: ['border-0', 'border-1', 'border-2'] },
  {
    title: 'Semantic',
    names: [
      'blue-1',
      'blue-2',
      'blue-3',
      'yellow-1',
      'yellow-2',
      'yellow-3',
      'red-1',
      'red-2',
      'red-3',
      'green-1',
      'green-2',
      'green-3',
      'purple-1',
      'purple-2',
      'purple-3',
      'cyan-1',
      'cyan-2',
      'cyan-3',
      'navy-1',
      'navy-2',
      'navy-3',
    ],
  },
  {
    title: 'Data viz',
    names: [
      'data-red',
      'data-orange',
      'data-yellow',
      'data-lime',
      'data-green',
      'data-teal',
      'data-blue',
      'data-purple',
      'data-pink',
      'data-green-gho',
    ],
  },
  {
    title: 'Shadows / effects',
    names: [
      'shadow-low',
      'shadow-medium',
      'shadow-high',
      'shadow-strong',
      'shadow-stroke-1',
      'shadow-stroke-2',
      'focus',
      'scrim',
      'selected',
      'button-hover',
    ],
  },
  {
    title: 'Chains',
    names: [
      'ethereum',
      'chain-testnet',
      'chain-ethereum',
      'chain-polygon',
      'chain-base',
      'chain-optimism',
      'chain-lens',
      'chain-arbitrum',
      'chain-blast',
      'chain-scroll',
      'chain-worldchain',
      'chain-zksync',
    ],
  },
];
