import { Skeleton, Typography, TypographyProps } from '@mui/material';
import { textCenterEllipsis } from 'src/helpers/text-center-ellipsis';

interface CompactableTypographyProps extends TypographyProps {
  children: string;
  from: number;
  to: number;
  compact: boolean;
  loading: boolean;
  skeletonWidth?: number;
}

export const CompactableTypography = ({
  from,
  to,
  compact,
  children,
  loading,
  skeletonWidth,
  ...rest
}: CompactableTypographyProps) => {
  return (
    <Typography {...rest}>
      {loading ? (
        <Skeleton width={skeletonWidth} />
      ) : compact ? (
        textCenterEllipsis(children, from, to)
      ) : (
        children
      )}
    </Typography>
  );
};
