import { Skeleton, Typography, TypographyProps } from '@mui/material';
import { textCenterEllipsis } from 'src/helpers/text-center-ellipsis';

export interface CompactableTypographyProps extends TypographyProps {
  children: string;
  compactMode?: CompactMode;
  compact?: boolean;
  loading?: boolean;
  skeletonWidth?: number;
}

export enum CompactMode {
  SM,
  MD,
  LG,
  XL,
  XXL,
}

const compactModeMap = {
  [CompactMode.SM]: {
    from: 4,
    to: 4,
  },
  [CompactMode.MD]: {
    from: 7,
    to: 4,
  },
  [CompactMode.LG]: {
    from: 12,
    to: 4,
  },
  [CompactMode.XL]: {
    from: 12,
    to: 3,
  },
  [CompactMode.XXL]: {
    from: 14,
    to: 7,
  },
};

export const CompactableTypography = ({
  compactMode = CompactMode.SM,
  compact = true,
  children,
  loading = false,
  skeletonWidth = 100,
  ...rest
}: CompactableTypographyProps) => {
  const selectedCompactMode = compactModeMap[compactMode];

  return (
    <Typography {...rest}>
      {loading ? (
        <Skeleton width={skeletonWidth} />
      ) : compact ? (
        textCenterEllipsis(children, selectedCompactMode.from, selectedCompactMode.to)
      ) : (
        children
      )}
    </Typography>
  );
};
