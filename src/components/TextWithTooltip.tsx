import { InformationCircleIcon } from '@heroicons/react/outline';
import { Box, IconButton, SvgIcon, Typography } from '@mui/material';
import { TypographyProps } from '@mui/material/Typography';
import { JSXElementConstructor, ReactElement, ReactNode, useState } from 'react';

import { ContentWithTooltip } from './ContentWithTooltip';

export interface TextWithTooltipProps extends TypographyProps {
  text?: ReactNode;
  icon?: ReactNode;
  iconSize?: number;
  // eslint-disable-next-line
  children?: ReactElement<any, string | JSXElementConstructor<any>>;
}

export const TextWithTooltip = ({
  text,
  icon,
  iconSize = 14,
  children,
  ...rest
}: TextWithTooltipProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {text && <Typography {...rest}>{text}</Typography>}

      <ContentWithTooltip tooltipContent={<>{children}</>} open={open} setOpen={setOpen}>
        <IconButton
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: iconSize,
            height: iconSize,
            borderRadius: '50%',
            p: 0,
            minWidth: 0,
            ml: 0.5,
          }}
        >
          <SvgIcon
            sx={{
              fontSize: iconSize,
              color: open ? 'info.main' : 'text.muted',
              borderRadius: '50%',
              '&:hover': { color: 'info.main' },
            }}
          >
            {icon || <InformationCircleIcon />}
          </SvgIcon>
        </IconButton>
      </ContentWithTooltip>
    </Box>
  );
};
