import { InformationCircleIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, IconButton, SvgIcon, Typography } from '@mui/material';
import { TypographyProps } from '@mui/material/Typography';
import { ReactNode, useState } from 'react';

import { BasicModal } from './primitives/BasicModal';

export interface TextWithModalProps extends TypographyProps {
  text?: ReactNode;
  icon?: ReactNode;
  iconSize?: number;
  iconColor?: string;
  withContentButton?: boolean;
}

export const TextWithModal = ({
  text,
  children,
  icon,
  iconSize = 12,
  iconColor = '#EAEBEF',
  withContentButton,
  ...rest
}: TextWithModalProps) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {text && <Typography {...rest}>{text}</Typography>}

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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOpen();
          }}
        >
          <SvgIcon sx={{ fontSize: iconSize, color: iconColor, borderRadius: '50%' }}>
            {icon || <InformationCircleIcon />}
          </SvgIcon>
        </IconButton>
      </Box>

      <BasicModal open={open} setOpen={setOpen}>
        {children}

        {withContentButton && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 8 }}>
            <Button variant="contained" onClick={() => setOpen(false)}>
              <Trans>Ok, I got it</Trans>
            </Button>
          </Box>
        )}
      </BasicModal>
    </>
  );
};
