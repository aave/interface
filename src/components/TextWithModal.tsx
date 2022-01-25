import { QuestionMarkCircleIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, IconButton, SvgIcon, Typography } from '@mui/material';
import { TypographyProps } from '@mui/material/Typography';
import { ReactNode, useState } from 'react';

import { BasicModal } from './primitives/BasicModal';

interface TextWithModalProps extends TypographyProps {
  text: ReactNode;
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
  iconColor = '#E0E5EA',
  withContentButton,
  ...rest
}: TextWithModalProps) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography {...rest}>{text}</Typography>
        <IconButton
          sx={{ width: iconSize, height: iconSize, borderRadius: '50%', p: 0, minWidth: 0 }}
          onClick={handleOpen}
        >
          <SvgIcon sx={{ fontSize: iconSize, color: iconColor, ml: '5px' }}>
            {icon || <QuestionMarkCircleIcon />}
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
