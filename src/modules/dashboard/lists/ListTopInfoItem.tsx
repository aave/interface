import { InformationCircleIcon } from '@heroicons/react/outline';
import { IconButton, Paper, SvgIcon, Typography } from '@mui/material';
import { ReactNode, useState } from 'react';

import { BasicModal } from '../../../components/primitives/BasicModal';
import { FormattedNumber } from '../../../components/primitives/FormattedNumber';

interface ListTopInfoItemProps {
  title: ReactNode;
  value: number | string;
  percent?: boolean;
  modalContent?: ReactNode;
}

export const ListTopInfoItem = ({ title, value, percent, modalContent }: ListTopInfoItemProps) => {
  const [open, setOpen] = useState(false);

  const iconSize = 14;

  return (
    <Paper
      variant="outlined"
      sx={{ mr: 2, p: '2px 4px', display: 'flex', alignItems: 'center', boxShadow: 'none' }}
    >
      <Typography color="text.secondary" sx={{ mr: 1 }}>
        {title}
      </Typography>
      <FormattedNumber value={value} percent={percent} variant="main14" symbol="USD" />

      {modalContent && (
        <IconButton
          onClick={() => setOpen(true)}
          sx={{ minWidth: 'unset', width: iconSize, height: iconSize, ml: 1 }}
        >
          <SvgIcon sx={{ fontSize: `${iconSize}px`, color: 'divider' }}>
            <InformationCircleIcon />
          </SvgIcon>
        </IconButton>
      )}
      {modalContent && (
        <BasicModal open={open} setOpen={setOpen}>
          {modalContent}
        </BasicModal>
      )}
    </Paper>
  );
};
