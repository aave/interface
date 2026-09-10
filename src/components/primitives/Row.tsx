import { Box, BoxProps, SxProps, Theme, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface RowProps extends BoxProps {
  caption?: ReactNode;
  captionVariant?: 'secondary16' | 'description' | 'subheader1' | 'caption' | 'h3';
  captionColor?: string;
  align?: 'center' | 'flex-start';
  /**
   * Reaches the caption's own Typography. Needed when the caption holds unbounded content — it
   * is a flex item, so without `minWidth: 0` (or a wrap) it cannot shrink and pushes the value
   * out of the row.
   */
  captionSx?: SxProps<Theme>;
}

export const Row = ({
  caption,
  children,
  captionVariant = 'secondary16',
  captionColor,
  align = 'center',
  captionSx,
  ...rest
}: RowProps) => {
  return (
    <Box
      {...rest}
      sx={{ display: 'flex', alignItems: align, justifyContent: 'space-between', ...rest.sx }}
    >
      {caption && (
        // `row-caption` is a public styling hook: `ListMobileItem` uses it to colour every card
        // caption at once. It outranks `captionColor`/`captionSx`, which are element-level.
        <Typography
          className="row-caption"
          component="div"
          variant={captionVariant}
          color={captionColor}
          sx={[{ mr: 2 }, ...(Array.isArray(captionSx) ? captionSx : [captionSx])]}
        >
          {caption}
        </Typography>
      )}

      {children}
    </Box>
  );
};
