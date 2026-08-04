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

export type ColorRole = 'bg' | 'text' | 'border' | 'shadow' | 'swatch';

// Figma color tokens grouped for the showcase. `role` decides how each group is presented — text
// colors as text, backgrounds as surfaces, borders as dividers, shadows as shadows. Names are keys
// of `figmaLight`, so each resolves in both light and dark via the flattened palette tokens.
export const COLOR_GROUPS: { title: string; role: ColorRole; names: FigmaColorName[] }[] = [
  {
    title: 'Backgrounds',
    role: 'bg',
    names: ['bg-max', 'bg-1', 'bg-2', 'bg-3', 'bg-4', 'bg-5', 'bg-6', 'bg-7'],
  },
  {
    title: 'Foreground / Text',
    role: 'text',
    names: ['fg-max', 'fg-1', 'fg-2', 'fg-3', 'fg-4', 'fg-5'],
  },
  { title: 'Borders / dividers', role: 'border', names: ['border-0', 'border-1', 'border-2'] },
  {
    title: 'Shadows',
    role: 'shadow',
    names: [
      'shadow-low',
      'shadow-medium',
      'shadow-high',
      'shadow-strong',
      'shadow-stroke-1',
      'shadow-stroke-2',
    ],
  },
];
