import { ExclamationCircleIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';
import { BasicModal } from './primitives/BasicModal';

export interface AddressBlockedProps {
  address: string;
}

export const AddressBlocked = ({ address }: AddressBlockedProps) => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  const setOpen = (_value: boolean) => {};

  return (
    <BasicModal open={true} withCloseButton={false} setOpen={setOpen}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <SvgIcon sx={{ fontSize: '24px', color: 'warning.main', mb: 2 }}>
          <ExclamationCircleIcon />
        </SvgIcon>
        <Typography variant="h2">
          <Trans>Blocked Address</Trans>
        </Typography>
        <Typography variant="helperText" sx={{ my: 4 }}>
          {address}
        </Typography>
        <Typography variant="description" sx={{ textAlign: 'center' }}>
          <Trans>
            This address is blocked on the interface because it is associated with one or more
            blocked activities.
          </Trans>
        </Typography>
      </Box>
    </BasicModal>
  );
};
